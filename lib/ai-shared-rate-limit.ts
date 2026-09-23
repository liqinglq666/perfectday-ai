import "server-only";

import { AI_RATE_LIMITS, consumeAiAllowance } from "@/lib/ai-rate-limit";

// Both counters are checked and incremented atomically. Redis owns expiration,
// so concurrent serverless instances cannot each grant a fresh allowance.
const SCRIPT = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local hour = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= tonumber(ARGV[1]) or hour >= tonumber(ARGV[2]) then return 0 end
if redis.call('INCR', KEYS[1]) == 1 then redis.call('PEXPIRE', KEYS[1], 60000) end
if redis.call('INCR', KEYS[2]) == 1 then redis.call('PEXPIRE', KEYS[2], 3600000) end
return 1`;

export async function checkAiAllowance(key: string): Promise<boolean> {
  if (!consumeAiAllowance(key)) return false;

  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)?.trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)?.trim();
  // Preserve the existing no-database setup. Shared limits activate when configured.
  if (!url && !token) return true;
  if (!url || !token) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const endpoint = new URL(url);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) return false;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
      body: JSON.stringify([
        "EVAL", SCRIPT, "2",
        `perfectday:ai:{${key}}:minute`, `perfectday:ai:{${key}}:hour`,
        String(AI_RATE_LIMITS.perMinute), String(AI_RATE_LIMITS.perHour)
      ])
    });
    if (!response.ok) return false;
    const payload: unknown = await response.json();
    return typeof payload === "object" && payload !== null &&
      "result" in payload && payload.result === 1 && !("error" in payload);
  } catch {
    // An unavailable configured limiter must not become an unlimited paid call.
    // The caller falls back to local route planning, without exposing credentials.
    return false;
  } finally {
    clearTimeout(timer);
  }
}
