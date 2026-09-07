import { places } from "@/data/places";
import { adjustPlan, createPlan, parseChanges, queryString } from "@/lib/planner";
import type { AdjustmentChange, PlanInput, Place, TripPlan, TripStop } from "@/types";

export type Mall = "holiday" | "golden";
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
type Params = Record<string, string | string[] | undefined>;
const caps = { "100": 100, "300": 300, "500": 500, plus: 800 };
const catalog = new Map(places.map(place => [place.id, place]));
export const mallName = (mall: Mall | "") => mall === "holiday" ? "假日广场" : mall === "golden" ? "石岐万象汇" : "尚未开始";
const mallOf = (place: Place): Mall => place.mall === "假日广场" ? "holiday" : "golden";
export function clockText(minutes: number) {
  const value = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
const refOf = (stop: Place & { status?: string }): StopRef => ({ id: stop.id, ...(stop.status === "replaced" ? { q: 1 as const } : {}) });
export function resolveStop(ref: StopRef): Place & { status?: "replaced" } {
  const place = catalog.get(ref.id)!;
  return ref.q && place.category === "food" ? { ...place, name: "石岐万象汇 · 餐饮区现场备选", floor: "餐饮区域 · 现场自选", searchKeyword: "中山石岐万象汇 餐饮", price: 90, status: "replaced", note: "请现场比较菜单和等待情况，预留人均90元用餐预算。未接入实时排队，不保证有空位。", sourceLabel: "商圈公共区域", sourceUrl: "https://www.zsnews.cn/trade/index/view/cateid/45/id/698538.html", evidenceNote: "这是现场自选安排，不是一家已核定的替代餐厅。" } : { ...place };
}
export function startJourney(input: PlanInput, changes: AdjustmentChange[] = []): Journey {
  const plan = changes.length ? adjustPlan(input, changes) : createPlan(input);
  return { v: 1, pending: plan.stops.map(refOf), done: [], skipped: [], clock: 840, minutes: input.duration, cash: caps[input.budget], current: "" };
}
const validInt = (value: unknown, max: number) => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max;
/** Only known place IDs and bounded scalar snapshots are accepted from share links. */
export function decodeJourney(raw: unknown): Journey | null {
  if (typeof raw !== "string" || raw.length > 7000) return null;
  try {
    const x = JSON.parse(raw);
    if (!x || x.v !== 1 || !Array.isArray(x.pending) || !Array.isArray(x.done) || !Array.isArray(x.skipped) ||
      x.pending.length > places.length || x.done.length > places.length || x.skipped.length > places.length ||
      !validInt(x.clock, 1439) || !validInt(x.minutes, 480) || !validInt(x.cash, 10000) || !["", "holiday", "golden"].includes(x.current)) return null;
    const validRef = (ref: StopRef) => ref && typeof ref.id === "string" && catalog.has(ref.id) &&
      (ref.q === undefined || (ref.q === 1 && catalog.get(ref.id)?.category === "food"));
    if (!x.pending.every(validRef) || !x.done.every((ref: Visit) => validRef(ref) && validInt(ref.t, 1439) && validInt(ref.d, 480) && validInt(ref.p, 10000) && validInt(ref.w, 120)) ||
      !x.skipped.every((id: unknown) => typeof id === "string" && catalog.has(id))) return null;
    const all = [...x.pending.map((ref: StopRef) => ref.id), ...x.done.map((ref: StopRef) => ref.id), ...x.skipped];
    if (new Set(all).size !== all.length) return null;
    const cleanRef = (ref: StopRef): StopRef => ({ id: ref.id, ...(ref.q ? { q: 1 as const } : {}) });
    return { v: 1, pending: x.pending.map(cleanRef), done: x.done.map((ref: Visit) => ({ ...cleanRef(ref), t: ref.t, d: ref.d, p: ref.p, w: ref.w })), skipped: x.skipped, clock: x.clock, minutes: x.minutes, cash: x.cash, current: x.current };
  } catch { return null; }
}
export function readJourney(input: PlanInput, params: Params) {
  return decodeJourney(params.journey) || startJourney(input, parseChanges(params));
}
export function journeyUrl(input: PlanInput, journey: Journey, path = "/trip") {
  return `${path}?${queryString(input)}&${new URLSearchParams({ journey: JSON.stringify(journey) })}`;
}
export function journeyPlan(journey: Journey, input: PlanInput): TripPlan {
  let elapsed = 0;
  const stops: TripStop[] = journey.pending.map(ref => {
    const place = resolveStop(ref), time = clockText(journey.clock + elapsed);
    elapsed += place.duration + place.walkMinutes;
    return { ...place, time };
  });
  const copy = createPlan(input);
  return { title: copy.title, subtitle: copy.subtitle, stops, totalMinutes: elapsed,
    totalPrice: stops.reduce((sum, stop) => sum + stop.price, 0), totalWalkMinutes: stops.reduce((sum, stop) => sum + stop.walkMinutes, 0) };
}
/** Group onward stops from the user's current mall; never insert an orphan crossing. */
function onward(items: StopRef[], current: Journey["current"], crossed: boolean): StopRef[] {
  const actual = items.filter(ref => resolveStop(ref).category !== "connector");
  if (!actual.length) return [];
  const firstMall = current || mallOf(resolveStop(actual[0]));
  const near = actual.filter(ref => mallOf(resolveStop(ref)) === firstMall);
  const far = actual.filter(ref => mallOf(resolveStop(ref)) !== firstMall);
  // A completed connector must never reappear in this one-way half-day route.
  if (crossed) return near;
  return [...near, ...(far.length && (current || near.length) ? [{ id: "connector" }] : []), ...far];
}
export function replanRemaining(input: PlanInput, journey: Journey, changes: AdjustmentChange[] = []) {
  const flags = new Set(changes), removed = new Map<string, string>();
  const crossed = journey.done.some(ref => ref.id === "connector") || journey.skipped.includes("connector");
  let items = [...journey.pending];
  const removeWhere = (predicate: (ref: StopRef) => boolean, reason: string) => {
    items = items.filter(ref => { if (!predicate(ref)) return true; if (ref.id !== "connector") removed.set(ref.id, reason); return false; });
  };
  if (flags.has("rain") || input.indoorOnly || input.scene === "rain") removeWhere(ref => !resolveStop(ref).indoor, "雨天优先室内");
  if (flags.has("walk") || flags.has("rain") || input.indoorOnly || input.scene === "rain") {
    const score = (mall: Mall) => items.reduce((sum, ref) => sum + (mallOf(resolveStop(ref)) === mall ? input.preferredPlaceIds?.includes(ref.id) ? 100 : input.scene === "family" && resolveStop(ref).category === "family" ? 20 : 1 : 0), 0);
    const chosen = journey.current || (score("holiday") >= score("golden") ? "holiday" : "golden");
    removeWhere(ref => ref.id === "connector" || mallOf(resolveStop(ref)) !== chosen, `集中在${mallName(chosen)}，减少换区`);
  }
  if (flags.has("queue")) items = items.map(ref => resolveStop(ref).category === "food" ? { id: ref.id, q: 1 } : ref);
  if (flags.has("budget")) {
    const paid = items.filter(ref => resolveStop(ref).price > 0).sort((a, b) => Number(input.preferredPlaceIds?.includes(a.id) || false) - Number(input.preferredPlaceIds?.includes(b.id) || false) || resolveStop(b).price - resolveStop(a).price)[0];
    if (paid) removeWhere(ref => ref.id === paid.id, "减少一项付费安排");
  }
  items = onward(items, journey.current, crossed);
  while (items.length) {
    const minutes = items.reduce((sum, ref) => sum + resolveStop(ref).duration + resolveStop(ref).walkMinutes, 0);
    const cash = items.reduce((sum, ref) => sum + resolveStop(ref).price, 0);
    if (minutes <= journey.minutes && cash <= journey.cash) break;
    const priority = (ref: StopRef) => input.preferredPlaceIds?.includes(ref.id) ? 100 : resolveStop(ref).category === "rest" && input.scene === "parents" ? 20 : resolveStop(ref).category === "family" && input.scene === "family" ? 20 : resolveStop(ref).category === "start" ? -1 : 0;
    const drop = items.map((ref, index) => ({ ref, index })).filter(({ ref }) => ref.id !== "connector")
      .sort((a, b) => priority(a.ref) - priority(b.ref) || b.index - a.index)[0];
    if (!drop) { items = []; break; }
    removed.set(drop.ref.id, minutes > journey.minutes ? "剩余时间不足，保留完整停留与步行时间" : "超出剩余预算");
    items = onward(items.filter(ref => ref.id !== drop.ref.id), journey.current, crossed);
  }
  for (const ref of journey.pending) if (ref.id !== "connector" && !items.some(item => item.id === ref.id) && !removed.has(ref.id)) removed.set(ref.id, "按当前所在商场整理后续路线");
  return { journey: { ...journey, pending: items }, removed: [...removed].map(([id, reason]) => ({ id, name: catalog.get(id)!.name, reason })) };
}
export function advanceJourney(input: PlanInput, journey: Journey, skip = false): Journey {
  const next = journey.pending[0];
  if (!next) return journey;
  const stop = resolveStop(next), remaining = journey.pending.slice(1);
  if (skip) return replanRemaining(input, { ...journey, pending: remaining, skipped: [...journey.skipped, next.id] }).journey;
  const cost = stop.duration + stop.walkMinutes;
  const current = stop.category === "connector" ? (remaining[0] ? mallOf(resolveStop(remaining[0])) : journey.current) : mallOf(stop);
  return replanRemaining(input, { ...journey, pending: remaining,
    done: [...journey.done, { ...next, t: journey.clock, d: stop.duration, p: stop.price, w: stop.walkMinutes }],
    clock: (journey.clock + cost) % 1440, minutes: Math.max(0, journey.minutes - cost), cash: Math.max(0, journey.cash - stop.price), current }).journey;
}
export function applyRemainingFields(journey: Journey, params: Params): Journey {
  const number = (name: string, fallback: number, max: number) => {
    const raw = params[name];
    if (typeof raw !== "string" || !/^\d{1,5}$/.test(raw)) return fallback;
    return Math.min(max, Number(raw));
  };
  const time = typeof params.from === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(params.from) ? params.from.split(":").map(Number) : null;
  const current = params.current === "holiday" || params.current === "golden" || params.current === "" ? params.current : journey.current;
  return { ...journey, minutes: number("left", journey.minutes, 480), cash: number("cash", journey.cash, 10000), clock: time ? time[0] * 60 + time[1] : journey.clock, current };
}
