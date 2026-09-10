import { createHash } from "node:crypto";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const MAX_PER_MINUTE = 12;
const MAX_PER_HOUR = 120;

type Bucket = {
  minuteStart: number;
  minuteCount: number;
  hourStart: number;
  hourCount: number;
  lastSeen: number;
};

type RateLimitGlobal = typeof globalThis & {
  __perfectDayAiRateLimit?: Map<string, Bucket>;
  __perfectDayAiRateLimitChecks?: number;
};

const runtime = globalThis as RateLimitGlobal;
const buckets = runtime.__perfectDayAiRateLimit ??= new Map<string, Bucket>();

export const AI_RATE_LIMITS = {
  perMinute: MAX_PER_MINUTE,
  perHour: MAX_PER_HOUR
} as const;

export function aiClientKey(ip: string, userAgent: string) {
  return createHash("sha256")
    .update(`${ip.slice(0, 128)}\n${userAgent.slice(0, 256)}`)
    .digest("hex")
    .slice(0, 24);
}

export function consumeAiAllowance(key: string, now = Date.now()) {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = {
      minuteStart: now,
      minuteCount: 0,
      hourStart: now,
      hourCount: 0,
      lastSeen: now
    };
    buckets.set(key, bucket);
  }

  if (now - bucket.minuteStart >= MINUTE_MS) {
    bucket.minuteStart = now;
    bucket.minuteCount = 0;
  }
  if (now - bucket.hourStart >= HOUR_MS) {
    bucket.hourStart = now;
    bucket.hourCount = 0;
  }

  bucket.lastSeen = now;
  if (bucket.minuteCount >= MAX_PER_MINUTE || bucket.hourCount >= MAX_PER_HOUR) return false;

  bucket.minuteCount += 1;
  bucket.hourCount += 1;

  runtime.__perfectDayAiRateLimitChecks = (runtime.__perfectDayAiRateLimitChecks || 0) + 1;
  if (runtime.__perfectDayAiRateLimitChecks % 100 === 0) {
    for (const [id, value] of buckets) {
      if (now - value.lastSeen > HOUR_MS * 2) buckets.delete(id);
    }
  }

  return true;
}
