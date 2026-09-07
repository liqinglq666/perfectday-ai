import { adjustPlan, createPlan, parseChanges, queryString } from "@/lib/planner";
import { BUDGET_CAP } from "@/lib/plan-config";
import { placeCatalog, placeCount } from "@/lib/place-catalog";
import { stopRef, type Journey, type StopRef, type Visit } from "@/lib/journey-core";
import type { AdjustmentChange, PlanInput } from "@/types";

export type JourneyParams = Record<string, string | string[] | undefined>;

export function startJourney(input: PlanInput, changes: AdjustmentChange[] = []): Journey {
  const plan = changes.length ? adjustPlan(input, changes) : createPlan(input);
  return {
    v: 1,
    pending: plan.stops.map(stopRef),
    done: [],
    skipped: [],
    clock: 840,
    minutes: input.duration,
    cash: BUDGET_CAP[input.budget],
    current: ""
  };
}

const validInt = (value: unknown, max: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max;

function validRef(ref: StopRef) {
  return Boolean(ref) && typeof ref.id === "string" && placeCatalog.has(ref.id) &&
    (ref.q === undefined || (ref.q === 1 && placeCatalog.get(ref.id)?.category === "food"));
}

function cleanRef(ref: StopRef): StopRef {
  return { id: ref.id, ...(ref.q ? { q: 1 as const } : {}) };
}

/** Only known place IDs and bounded scalar snapshots are accepted from share links. */
export function decodeJourney(raw: unknown): Journey | null {
  if (typeof raw !== "string" || raw.length > 7000) return null;

  try {
    const value = JSON.parse(raw);
    if (!value || value.v !== 1 || !Array.isArray(value.pending) || !Array.isArray(value.done) ||
      !Array.isArray(value.skipped) || value.pending.length > placeCount || value.done.length > placeCount ||
      value.skipped.length > placeCount || !validInt(value.clock, 1439) || !validInt(value.minutes, 480) ||
      !validInt(value.cash, 10000) || !["", "holiday", "golden"].includes(value.current)) return null;

    if (!value.pending.every(validRef) ||
      !value.done.every((ref: Visit) => validRef(ref) && validInt(ref.t, 1439) && validInt(ref.d, 480) &&
        validInt(ref.p, 10000) && validInt(ref.w, 120)) ||
      !value.skipped.every((id: unknown) => typeof id === "string" && placeCatalog.has(id))) return null;

    const all = [
      ...value.pending.map((ref: StopRef) => ref.id),
      ...value.done.map((ref: StopRef) => ref.id),
      ...value.skipped
    ];
    if (new Set(all).size !== all.length) return null;

    return {
      v: 1,
      pending: value.pending.map(cleanRef),
      done: value.done.map((ref: Visit) => ({ ...cleanRef(ref), t: ref.t, d: ref.d, p: ref.p, w: ref.w })),
      skipped: value.skipped,
      clock: value.clock,
      minutes: value.minutes,
      cash: value.cash,
      current: value.current
    };
  } catch {
    return null;
  }
}

export function readJourney(input: PlanInput, params: JourneyParams) {
  return decodeJourney(params.journey) || startJourney(input, parseChanges(params));
}

export function journeyUrl(input: PlanInput, journey: Journey, path = "/trip") {
  return `${path}?${queryString(input)}&${new URLSearchParams({ journey: JSON.stringify(journey) })}`;
}

export function applyRemainingFields(journey: Journey, params: JourneyParams): Journey {
  const number = (name: string, fallback: number, max: number) => {
    const raw = params[name];
    if (typeof raw !== "string" || !/^\d{1,5}$/.test(raw)) return fallback;
    return Math.min(max, Number(raw));
  };
  const time = typeof params.from === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(params.from)
    ? params.from.split(":").map(Number)
    : null;
  const current = params.current === "holiday" || params.current === "golden" || params.current === ""
    ? params.current
    : journey.current;

  return {
    ...journey,
    minutes: number("left", journey.minutes, 480),
    cash: number("cash", journey.cash, 10000),
    clock: time ? time[0] * 60 + time[1] : journey.clock,
    current
  };
}
