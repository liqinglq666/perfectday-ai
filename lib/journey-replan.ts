import { allPlaces, mallKey, requirePlace } from "@/lib/place-catalog";
import {
  mallName,
  resolveStop,
  type Journey,
  type Mall,
  type StopRef
} from "@/lib/journey-core";
import type { AdjustmentChange, PlanInput, Place } from "@/types";

const replaceableCategories = new Set<Place["category"]>(["coffee", "food", "shopping"]);
const queueOnlyMealIds = new Set(["golden-zhenlong", "golden-longfa", "holiday-ajisen"]);
const evidenceRank = { online_listing: 2, published_reference: 1, public_area: 0 } as const;
const precisionRank = { exact: 2, mall: 1, area: 0 } as const;

/** Group onward stops from the user's current mall; never insert an orphan crossing. */
function onward(items: StopRef[], current: Journey["current"], crossed: boolean): StopRef[] {
  const actual = items.filter(ref => resolveStop(ref).category !== "connector");
  if (!actual.length) return [];

  const firstMall = current || mallKey(resolveStop(actual[0]));
  const near = actual.filter(ref => mallKey(resolveStop(ref)) === firstMall);
  const far = actual.filter(ref => mallKey(resolveStop(ref)) !== firstMall);

  // A completed connector must never reappear in this one-way half-day route.
  if (crossed) return near;
  return [...near, ...(far.length && (current || near.length) ? [{ id: "connector" }] : []), ...far];
}

function bestSameMallAlternative(source: Place, chosen: Mall, input: PlanInput, unavailable: Set<string>) {
  if (!replaceableCategories.has(source.category)) return null;

  const needsIndoor = input.indoorOnly || input.scene === "rain";

  return allPlaces
    .filter(place =>
      mallKey(place) === chosen &&
      place.category === source.category &&
      !queueOnlyMealIds.has(place.id) &&
      !unavailable.has(place.id) &&
      !input.excludedPlaceIds?.includes(place.id) &&
      (!needsIndoor || place.indoor) &&
      place.tags.includes(input.scene))
    .sort((a, b) =>
      Number(input.preferredPlaceIds?.includes(b.id) || false) - Number(input.preferredPlaceIds?.includes(a.id) || false) ||
      evidenceRank[b.evidenceStatus] - evidenceRank[a.evidenceStatus] ||
      precisionRank[b.locationPrecision] - precisionRank[a.locationPrecision] ||
      a.walkMinutes - b.walkMinutes || a.price - b.price)[0] || null;
}

function bestQueueAlternative(source: Place, input: PlanInput, unavailable: Set<string>) {
  const chosen = mallKey(source);
  const needsIndoor = input.indoorOnly || input.scene === "rain";

  return allPlaces
    .filter(place =>
      mallKey(place) === chosen &&
      place.category === "food" &&
      place.id !== source.id &&
      !unavailable.has(place.id) &&
      !input.excludedPlaceIds?.includes(place.id) &&
      (!needsIndoor || place.indoor) &&
      place.tags.includes(input.scene))
    .sort((a, b) =>
      Number(input.preferredPlaceIds?.includes(b.id) || false) - Number(input.preferredPlaceIds?.includes(a.id) || false) ||
      Number(queueOnlyMealIds.has(b.id)) - Number(queueOnlyMealIds.has(a.id)) ||
      evidenceRank[b.evidenceStatus] - evidenceRank[a.evidenceStatus] ||
      precisionRank[b.locationPrecision] - precisionRank[a.locationPrecision] ||
      a.price - b.price || a.walkMinutes - b.walkMinutes)[0] || null;
}

/** Replace portable far-away categories with reviewed candidates in the chosen mall before deleting them. */
function replaceWithSameMall(
  items: StopRef[],
  chosen: Mall,
  input: PlanInput,
  journey: Journey,
  removed: Map<string, string>
) {
  const unavailable = new Set<string>([
    ...journey.done.map(ref => ref.id),
    ...journey.skipped,
    ...(input.excludedPlaceIds || [])
  ]);
  const localCategories = new Set(items
    .filter(ref => ref.id !== "connector" && mallKey(resolveStop(ref)) === chosen)
    .map(ref => resolveStop(ref).category));

  return items.map(ref => {
    if (ref.id === "connector") return ref;
    const source = resolveStop(ref);
    if (mallKey(source) === chosen || localCategories.has(source.category)) return ref;

    const alternative = bestSameMallAlternative(source, chosen, input, unavailable);
    if (!alternative) return ref;

    unavailable.add(alternative.id);
    localCategories.add(alternative.category);
    removed.set(ref.id, `改为${mallName(chosen)}同类候选：${alternative.name}`);
    return { id: alternative.id };
  });
}

export function replanRemaining(input: PlanInput, journey: Journey, changes: AdjustmentChange[] = []) {
  const flags = new Set(changes);
  const removed = new Map<string, string>();
  const crossed = journey.done.some(ref => ref.id === "connector") || journey.skipped.includes("connector");
  let items = [...journey.pending];

  const removeWhere = (predicate: (ref: StopRef) => boolean, reason: string) => {
    items = items.filter(ref => {
      if (!predicate(ref)) return true;
      if (ref.id !== "connector") removed.set(ref.id, reason);
      return false;
    });
  };

  if (flags.has("rain") || input.indoorOnly || input.scene === "rain") {
    removeWhere(ref => !resolveStop(ref).indoor, "雨天优先室内");
  }

  if (flags.has("walk") || flags.has("rain") || input.indoorOnly || input.scene === "rain") {
    const score = (mall: Mall) => items.reduce((sum, ref) => sum + (
      mallKey(resolveStop(ref)) === mall
        ? input.preferredPlaceIds?.includes(ref.id)
          ? 100
          : input.scene === "family" && resolveStop(ref).category === "family" ? 20 : 1
        : 0
    ), 0);
    const chosen = journey.current || (score("holiday") >= score("golden") ? "holiday" : "golden");
    items = replaceWithSameMall(items, chosen, input, journey, removed);
    removeWhere(ref => ref.id === "connector" || mallKey(resolveStop(ref)) !== chosen,
      `集中在${mallName(chosen)}，减少换区`);
  }

  if (flags.has("queue")) {
    const unavailable = new Set<string>([
      ...journey.done.map(ref => ref.id),
      ...journey.skipped,
      ...(input.excludedPlaceIds || []),
      ...items.map(ref => ref.id)
    ]);

    items = items.map(ref => {
      const source = resolveStop(ref);
      if (source.category !== "food") return ref;

      unavailable.delete(ref.id);
      const alternative = bestQueueAlternative(source, input, unavailable);
      unavailable.add(ref.id);

      if (!alternative) return { id: ref.id, q: 1 };

      unavailable.add(alternative.id);
      removed.set(ref.id, `排队时改为同商场备选：${alternative.name}`);
      return { id: alternative.id };
    });
  }

  if (flags.has("budget")) {
    const paid = items
      .filter(ref => resolveStop(ref).price > 0)
      .sort((a, b) =>
        Number(input.preferredPlaceIds?.includes(a.id) || false) -
        Number(input.preferredPlaceIds?.includes(b.id) || false) ||
        resolveStop(b).price - resolveStop(a).price)[0];
    if (paid) removeWhere(ref => ref.id === paid.id, "减少一项付费安排");
  }

  items = onward(items, journey.current, crossed);
  while (items.length) {
    const minutes = items.reduce((sum, ref) =>
      sum + resolveStop(ref).duration + resolveStop(ref).walkMinutes, 0);
    const cash = items.reduce((sum, ref) => sum + resolveStop(ref).price, 0);
    if (minutes <= journey.minutes && cash <= journey.cash) break;

    const priority = (ref: StopRef) => input.preferredPlaceIds?.includes(ref.id) ? 100
      : resolveStop(ref).category === "rest" && input.scene === "parents" ? 20
      : resolveStop(ref).category === "family" && input.scene === "family" ? 20
      : resolveStop(ref).category === "start" ? -1
      : 0;

    const drop = items
      .map((ref, index) => ({ ref, index }))
      .filter(({ ref }) => ref.id !== "connector")
      .sort((a, b) => priority(a.ref) - priority(b.ref) || b.index - a.index)[0];

    if (!drop) {
      items = [];
      break;
    }

    removed.set(drop.ref.id,
      minutes > journey.minutes ? "剩余时间不足，保留完整停留与步行时间" : "超出剩余预算");
    items = onward(items.filter(ref => ref.id !== drop.ref.id), journey.current, crossed);
  }

  for (const ref of journey.pending) {
    if (ref.id !== "connector" && !items.some(item => item.id === ref.id) && !removed.has(ref.id)) {
      removed.set(ref.id, "按当前所在商场整理后续路线");
    }
  }

  return {
    journey: { ...journey, pending: items },
    removed: [...removed].map(([id, reason]) => ({ id, name: requirePlace(id).name, reason }))
  };
}
