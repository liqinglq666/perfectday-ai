export const LAST_TRIP_KEY = "perfectday:last-trip:v1";
export const UNDO_TRIP_KEY = "perfectday:undo:v1";
export interface SavedTrip { v: 1; href: string; title: string; done: number; left: number; savedAt: number }
export interface TripUndo { from: string; to: string; label: string }
export function isTripHref(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 10000 || !value.startsWith("/trip?")) return false;
  try { const url = new URL(value, "https://perfectday.local"); return url.origin === "https://perfectday.local" && url.pathname === "/trip" && url.searchParams.has("journey"); }
  catch { return false; }
}
export function readSavedTrip(raw: string | null): SavedTrip | null {
  try {
    const x = JSON.parse(raw || "null");
    if (!x || x.v !== 1 || !isTripHref(x.href) || typeof x.title !== "string" || x.title.length > 80 ||
      !Number.isInteger(x.done) || x.done < 0 || x.done > 20 || !Number.isInteger(x.left) || x.left < 0 || x.left > 20 ||
      !Number.isFinite(x.savedAt) || x.savedAt <= 0) return null;
    return { v: 1, href: x.href, title: x.title, done: x.done, left: x.left, savedAt: x.savedAt };
  } catch { return null; }
}
export function readTripUndo(raw: string | null, current: string): TripUndo | null {
  try {
    const x = JSON.parse(raw || "null");
    return x && isTripHref(x.from) && isTripHref(x.to) && x.to === current && x.from !== x.to && typeof x.label === "string" && x.label.length <= 60 ? { from: x.from, to: x.to, label: x.label } : null;
  } catch { return null; }
}
