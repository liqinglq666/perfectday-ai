"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { aiClientKey } from "@/lib/ai-rate-limit";
import { checkAiAllowance } from "@/lib/ai-shared-rate-limit";
import { interpretWithBailian } from "@/lib/bailian";
import { parseInput, queryString } from "@/lib/planner";

export async function generateTrip(formData: FormData) {
  const fields: Record<string, string> = {};
  for (const key of ["request", "scene", "duration", "budget", "walking"]) {
    const value = formData.get(key);
    if (typeof value === "string") fields[key] = value.slice(0, 600);
  }

  const input = parseInput(fields, false);
  const canCallAi = Boolean(process.env.DASHSCOPE_API_KEY?.trim()) && Boolean(input.request.trim());

  if (canCallAi) {
    const requestHeaders = await headers();
    const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwardedFor || requestHeaders.get("x-real-ip")?.trim() || "unknown";
    const key = aiClientKey(ip);

    if (!await checkAiAllowance(key)) {
      const fallback = { ...parseInput(fields, true), intentSource: "fallback" as const };
      redirect(`/trip?${queryString(fallback)}`);
    }
  }

  const resolved = await interpretWithBailian(input);
  redirect(`/trip?${queryString(resolved)}`);
}
