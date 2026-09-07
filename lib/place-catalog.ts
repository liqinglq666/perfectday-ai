import { places } from "@/data/places";
import type { Place } from "@/types";

export type MallKey = "holiday" | "golden";

export const allPlaces = places;
export const placeCount = places.length;
export const placeCatalog = new Map(places.map((place) => [place.id, place]));

export function getPlace(id: string) {
  return placeCatalog.get(id);
}

export function requirePlace(id: string): Place {
  const place = getPlace(id);
  if (!place) throw new Error(`Unknown place: ${id}`);
  return place;
}

export function hasPlace(id: string) {
  return placeCatalog.has(id);
}

export function mallKey(place: Place): MallKey {
  return place.mall === "假日广场" ? "holiday" : "golden";
}

export function mallDisplayName(mall: MallKey | "") {
  return mall === "holiday" ? "假日广场" : mall === "golden" ? "石岐万象汇" : "尚未开始";
}

export function insertBeforeFood(items: Place[], place: Place) {
  if (items.some((item) => item.id === place.id)) return items;
  const foodIndex = items.findIndex((item) => item.category === "food");
  const next = [...items];
  next.splice(foodIndex >= 0 ? foodIndex : next.length, 0, place);
  return next;
}

/** Keep the current product convention: Holiday Plaza first, one connector, then MixC-side stops. */
export function orderByMall(items: Place[]) {
  const holiday = items.filter((item) => item.mall === "假日广场");
  const golden = items.filter((item) => item.mall !== "假日广场" && item.category !== "connector");
  const connector = items.find((item) => item.category === "connector");
  return [...holiday, ...(holiday.length && golden.length ? [connector || requirePlace("connector")] : []), ...golden];
}
