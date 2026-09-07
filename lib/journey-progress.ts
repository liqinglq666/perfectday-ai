import { mallKey } from "@/lib/place-catalog";
import { replanRemaining } from "@/lib/journey-replan";
import { resolveStop, type Journey } from "@/lib/journey-core";
import type { PlanInput } from "@/types";

export function advanceJourney(input: PlanInput, journey: Journey, skip = false): Journey {
  const next = journey.pending[0];
  if (!next) return journey;

  const stop = resolveStop(next);
  const remaining = journey.pending.slice(1);
  if (skip) {
    return replanRemaining(input, {
      ...journey,
      pending: remaining,
      skipped: [...journey.skipped, next.id]
    }).journey;
  }

  const cost = stop.duration + stop.walkMinutes;
  const current = stop.category === "connector"
    ? (remaining[0] ? mallKey(resolveStop(remaining[0])) : journey.current)
    : mallKey(stop);

  return replanRemaining(input, {
    ...journey,
    pending: remaining,
    done: [...journey.done, {
      ...next,
      t: journey.clock,
      d: stop.duration,
      p: stop.price,
      w: stop.walkMinutes
    }],
    clock: (journey.clock + cost) % 1440,
    minutes: Math.max(0, journey.minutes - cost),
    cash: Math.max(0, journey.cash - stop.price),
    current
  }).journey;
}
