import { createPlan } from "@/lib/planner";
import { mallDisplayName, mallKey, requirePlace, type MallKey } from "@/lib/place-catalog";
import type { PlanInput, Place, TripPlan, TripStop } from "@/types";

export type Mall = MallKey;
export type StopRef = { id: string; q?: 1 };
export type Visit = StopRef & { t: number; d: number; p: number; w: number };

export interface Journey {
  v: 1;
  pending: StopRef[];
  done: Visit[];
  skipped: string[];
  clock: number;
  minutes: number;
  cash: number;
  current: Mall | "";
}

export const mallName = mallDisplayName;

export function clockText(minutes: number) {
  const value = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function stopRef(stop: Place & { status?: string }): StopRef {
  return {
    id: stop.id,
    ...(stop.status === "replaced" ? { q: 1 as const } : {})
  };
}

export function resolveStop(ref: StopRef): Place & { status?: "replaced" } {
  const place = requirePlace(ref.id);
  if (!ref.q || place.category !== "food") return { ...place };

  const mall = mallKey(place);
  const label = mallName(mall);
  return {
    ...place,
    name: `${label} · 餐饮区现场备选`,
    floor: "餐饮区域 · 现场自选",
    address: mall === "holiday"
      ? "中山市石岐街道兴中道6号假日广场"
      : "中山市石岐区孙文东路28号中山石岐万象汇",
    searchKeyword: `${label} 餐饮`,
    price: Math.min(place.price, 90),
    status: "replaced",
    note: "请在当前商场餐饮区现场比较菜单和等待情况；未接入实时排队，不保证有空位。",
    sourceLabel: "商场公共区域",
    sourceUrl: undefined,
    evidenceNote: "这是当前商场内的现场自选安排，不是一家已核定的替代餐厅。",
    evidenceStatus: "public_area",
    locationPrecision: "area"
  };
}

export function journeyPlan(journey: Journey, input: PlanInput): TripPlan {
  let elapsed = 0;
  const stops: TripStop[] = journey.pending.map(ref => {
    const place = resolveStop(ref);
    const time = clockText(journey.clock + elapsed);
    elapsed += place.duration + place.walkMinutes;
    return { ...place, time };
  });
  const copy = createPlan(input);
  return {
    title: copy.title,
    subtitle: copy.subtitle,
    stops,
    totalMinutes: elapsed,
    totalPrice: stops.reduce((sum, stop) => sum + stop.price, 0),
    totalWalkMinutes: stops.reduce((sum, stop) => sum + stop.walkMinutes, 0)
  };
}
