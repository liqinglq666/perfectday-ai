import { applyClosedPlaceHints } from "@/lib/closed-places";
import {
  BUDGET_CAP,
  PLAN_TEMPLATES,
  SCENE_COPY,
  isBudget,
  isScene,
  isWalking
} from "@/lib/plan-config";
import {
  allPlaces,
  getPlace,
  hasPlace,
  insertBeforeFood,
  orderByMall,
  requirePlace
} from "@/lib/place-catalog";
import { applyRequestHints } from "@/lib/request-hints";
import type { AdjustmentChange, PlanInput, Place, Scene, TripPlan, TripStop } from "@/types";

export { isBudget, isScene, isWalking };

function toClock(totalMinutes: number) {
  const value = 14 * 60 + totalMinutes;
  const hour = Math.floor(value / 60) % 24;
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function applyResolvedPlaces(items: Place[], input: PlanInput) {
  const excluded = new Set(input.excludedPlaceIds || []);
  let result = items.filter((item) => !excluded.has(item.id));

  for (const id of input.preferredPlaceIds || []) {
    const place = getPlace(id);
    if (!place || excluded.has(id) || result.some((item) => item.id === id)) continue;

    const sameCategory = result.findIndex((item) =>
      item.category === place.category && !input.preferredPlaceIds?.includes(item.id));

    if (sameCategory >= 0) result[sameCategory] = place;
    else result = insertBeforeFood(result, place);
  }

  if (input.indoorOnly || input.scene === "rain") {
    result = result.filter((item) => item.indoor);
  }
  return result;
}

function withinLimits(items: Place[], input: PlanInput) {
  let result = orderByMall(items);
  const preferred = new Set(input.preferredPlaceIds || []);

  while (result.length && (
    result.reduce((sum, item) => sum + item.price, 0) > BUDGET_CAP[input.budget] ||
    result.reduce((sum, item) => sum + item.duration + item.walkMinutes, 0) > input.duration
  )) {
    const candidates = result
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.category !== "connector")
      .sort((a, b) => {
        const priority = (item: Place) => preferred.has(item.id) ? 100
          : item.category === "start" ? -1
          : item.category === "family" && input.scene === "family" ? 20
          : item.category === "rest" && input.scene === "parents" ? 10
          : 0;
        return priority(a.item) - priority(b.item) || b.index - a.index;
      });

    if (!candidates.length) return [];
    result.splice(candidates[0].index, 1);
    result = orderByMall(result);
  }

  return result;
}

// Fewer mall changes reduce walking without inventing shorter travel times.
function oneMall<T extends Place>(items: T[], preferred: string[] = [], scene?: Scene): T[] {
  const groups = [
    items.filter((item) => item.mall === "假日广场"),
    items.filter((item) => item.mall !== "假日广场" && item.category !== "connector")
  ];
  const score = (group: T[]) => group.reduce((sum, item) => sum +
    (preferred.includes(item.id) ? 100 : item.category === "family" && scene === "family" ? 20 : 1), 0);
  return groups.sort((a, b) => score(b) - score(a))[0];
}

/** When a single-mall route drops a far-side category, use a reviewed same-category candidate if available. */
function oneMallWithAlternatives(items: Place[], input: PlanInput): Place[] {
  const selected = oneMall(items, input.preferredPlaceIds, input.scene);
  if (!selected.length) return selected;

  const mall = selected[0].mall;
  const excluded = new Set(input.excludedPlaceIds || []);
  const missingCategories = [...new Set(items
    .filter((item) => item.category !== "connector" && item.mall !== mall)
    .map((item) => item.category))];

  let result = [...selected];
  for (const category of missingCategories) {
    if (result.some((item) => item.category === category)) continue;
    const candidate = allPlaces.find((item) =>
      item.mall === mall &&
      item.category === category &&
      item.tags.includes(input.scene) &&
      !excluded.has(item.id));
    if (candidate) result = insertBeforeFood(result, candidate);
  }
  return result;
}

function summarize(items: Place[], copy: { title: string; subtitle: string }): TripPlan {
  let elapsed = 0;
  const stops: TripStop[] = orderByMall(items).map((item) => {
    const stop = { ...item, time: toClock(elapsed) };
    elapsed += item.duration + item.walkMinutes;
    return stop;
  });

  return {
    ...copy,
    subtitle: stops.length ? copy.subtitle : "当前地点库没有符合这些条件的安排，请放宽条件后重新规划。",
    stops,
    totalMinutes: elapsed,
    totalPrice: stops.reduce((sum, item) => sum + item.price, 0),
    totalWalkMinutes: stops.reduce((sum, item) => sum + item.walkMinutes, 0)
  };
}

export function createPlan(rawInput: PlanInput): TripPlan {
  const input = applyRequestHints(applyClosedPlaceHints(rawInput));
  let selected = applyResolvedPlaces(PLAN_TEMPLATES[input.scene].map(requirePlace), input);

  // Public reports confirm connection, but do not establish a fully sheltered path.
  if (input.indoorOnly || input.scene === "rain") selected = oneMallWithAlternatives(selected, input);
  if (input.excludedPlaceIds?.includes("connector")) selected = oneMallWithAlternatives(selected, input);
  if (input.walking === "low") {
    const preferredMalls = new Set(selected
      .filter((item) => input.preferredPlaceIds?.includes(item.id))
      .map((item) => item.mall));
    if (preferredMalls.size <= 1) selected = oneMallWithAlternatives(selected, input);
  }

  return summarize(withinLimits(selected, input), SCENE_COPY[input.scene]);
}

export function adjustPlan(rawInput: PlanInput, change: AdjustmentChange | AdjustmentChange[]): TripPlan {
  const input = applyRequestHints(applyClosedPlaceHints(rawInput));
  const base = createPlan(input);
  const changes = new Set(Array.isArray(change) ? change : [change]);
  let stops: TripStop[] = base.stops.map((stop) => ({ ...stop, status: "kept" }));

  if (changes.has("rain")) {
    stops = oneMall(stops.filter((stop) => stop.indoor), input.preferredPlaceIds, input.scene);
  }
  if (changes.has("walk")) {
    stops = oneMall(stops, input.preferredPlaceIds, input.scene);
  }
  if (changes.has("queue")) {
    stops = stops.map((stop) => {
      if (stop.category !== "food") return stop;

      const inHolidayPlaza = stop.mall === "假日广场";
      const mallLabel = inHolidayPlaza ? "假日广场" : "石岐万象汇";
      return {
        ...stop,
        name: `${mallLabel} · 餐饮区现场备选`,
        floor: "餐饮区域 · 现场自选",
        address: inHolidayPlaza
          ? "中山市石岐街道兴中道6号假日广场"
          : "中山市石岐区孙文东路28号中山石岐万象汇",
        searchKeyword: `${mallLabel} 餐饮 中山`,
        price: Math.min(stop.price, 90),
        status: "replaced" as const,
        note: "请在当前商场餐饮区现场比较菜单和等待情况；未接入实时排队，不保证有空位。",
        sourceLabel: "商场公共区域",
        sourceUrl: undefined,
        evidenceNote: "这是当前商场内的现场自选安排，不是一家已核定的替代餐厅。",
        evidenceStatus: "public_area" as const,
        locationPrecision: "area" as const
      };
    });
  }
  if (changes.has("budget")) {
    const paid = [...stops]
      .filter((stop) => stop.price > 0)
      .sort((a, b) =>
        Number(input.preferredPlaceIds?.includes(a.id) || false) -
        Number(input.preferredPlaceIds?.includes(b.id) || false) || b.price - a.price)[0];
    if (paid) stops = stops.filter((stop) => stop.id !== paid.id);
  }

  return summarize(stops, base);
}

export function parseChanges(params: Record<string, string | string[] | undefined>): AdjustmentChange[] {
  const raw = Array.isArray(params.changes)
    ? params.changes.slice(0, 4).join(",")
    : typeof params.changes === "string"
      ? params.changes
      : typeof params.change === "string" ? params.change : "";
  return [...new Set(raw.slice(0, 100).split(",")
    .map(parseChange)
    .filter((value): value is AdjustmentChange => value !== null))];
}

export function changeQuery(changes: AdjustmentChange[]) {
  return changes.length ? `&changes=${changes.join(",")}` : "";
}

export function describeChanges(base: TripPlan, plan: TripPlan) {
  const removed = base.stops.filter((stop) =>
    stop.category !== "connector" && !plan.stops.some((item) => item.id === stop.id)).length;
  const savings = base.totalPrice - plan.totalPrice;
  const walking = base.totalWalkMinutes - plan.totalWalkMinutes;
  const details = [
    removed ? `减少 ${removed} 个停留点` : "",
    savings > 0 ? `预计节省 ¥${savings}` : "",
    walking > 0 ? `少走约 ${walking} 分钟` : "",
    plan.stops.some((stop) => stop.status === "replaced") ? "餐厅改为现场备选" : ""
  ].filter(Boolean);
  return details.length ? details.join(" · ") : "当前路线已符合这些条件，无需额外调整。";
}

export function parseInput(params: Record<string, string | string[] | undefined>, inferRequest = true): PlanInput {
  const value = (key: string, fallback: string) => {
    const raw = params[key];
    return typeof raw === "string" ? raw : fallback;
  };
  const ids = (key: string) => [...new Set(value(key, "").slice(0, 600).split(","))].filter(hasPlace);

  const scene = value("scene", "friends");
  const duration = Number(value("duration", "240"));
  const budget = value("budget", "500");
  const walking = value("walking", "low");
  const source = value("ai", "");

  const input: PlanInput = {
    request: value("request", "").slice(0, 600),
    scene: isScene(scene) ? scene : "friends",
    duration: Number.isFinite(duration) ? Math.max(90, Math.min(480, Math.round(duration))) : 240,
    budget: isBudget(budget) ? budget : "500",
    walking: isWalking(walking) ? walking : "low",
    ...(source === "bailian" ? {
      intentSource: "bailian" as const,
      preferredPlaceIds: ids("preferred"),
      excludedPlaceIds: ids("excluded"),
      indoorOnly: value("indoor", "0") === "1"
    } : source === "fallback" ? { intentSource: "fallback" as const } : {})
  };

  const parsed = inferRequest ? applyRequestHints(input) : input;
  return applyClosedPlaceHints(parsed);
}

export function parseChange(value: string | string[] | undefined): AdjustmentChange | null {
  if (typeof value !== "string") return null;
  return ["rain", "walk", "budget", "queue"].includes(value) ? value as AdjustmentChange : null;
}

export function queryString(input: PlanInput) {
  const params = new URLSearchParams({
    request: input.request,
    scene: input.scene,
    duration: String(input.duration),
    budget: input.budget,
    walking: input.walking
  });
  if (input.intentSource) params.set("ai", input.intentSource);
  if (input.intentSource === "bailian") {
    if (input.preferredPlaceIds?.length) params.set("preferred", input.preferredPlaceIds.join(","));
    if (input.excludedPlaceIds?.length) params.set("excluded", input.excludedPlaceIds.join(","));
    if (input.indoorOnly) params.set("indoor", "1");
  }
  return params.toString();
}
