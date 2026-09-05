"use server";

import { redirect } from "next/navigation";
import { interpretWithBailian } from "@/lib/bailian";
import { parseInput, queryString } from "@/lib/planner";

export async function generateTrip(formData: FormData) {
  const fields: Record<string, string> = {};
  for (const key of ["request", "scene", "duration", "budget", "walking"]) {
    const value = formData.get(key);
    if (typeof value === "string") fields[key] = value.slice(0, 600);
  }
  const input = parseInput(fields, false);
  const resolved = await interpretWithBailian(input);
  redirect(`/trip?${queryString(resolved)}`);
}
