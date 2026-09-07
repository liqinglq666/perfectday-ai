import { closedPlaces, type ClosedPlace } from "@/data/closed-places";
import { places } from "@/data/places";
import type { PlanInput } from "@/types";

const placeById = new Map(places.map(place => [place.id, place]));
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function isNegated(text: string, alias: string) {
  const pattern = escapeRegex(alias);
  return new RegExp(`(?:不(?:想|要|去|喝|吃|逛|选)?|别|避开)[^，。；！？,;!?\\n]{0,8}${pattern}`, "i").test(text);
}

function matchesClosedPlace(text: string, place: ClosedPlace) {
  return place.aliases.some(alias => new RegExp(escapeRegex(alias), "i").test(text) && !isNegated(text, alias));
}

export function mentionedClosedPlaces(text: string) {
  const value = text.trim();
  if (!value) return [];
  return closedPlaces.filter(place => matchesClosedPlace(value, place));
}

export function closedPlaceNotices(text: string) {
  return mentionedClosedPlaces(text).map(place => ({
    id: place.id,
    name: place.name,
    closedAt: place.closedAt,
    closureLabel: place.closureLabel,
    sourceLabel: place.sourceLabel,
    sourceUrl: place.sourceUrl,
    alternatives: place.alternativePlaceIds
      .map(id => placeById.get(id))
      .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
      .slice(0, 2)
      .map(candidate => ({ id: candidate.id, name: candidate.name, category: candidate.category }))
  }));
}

/**
 * Convert a stale explicit merchant request into a current reviewed candidate.
 * Closed merchants themselves never enter preferred/excluded route IDs.
 * For local parsing, an explicit closed merchant outranks a generic category word such as “咖啡”.
 */
export function applyClosedPlaceHints(input: PlanInput): PlanInput {
  const matches = mentionedClosedPlaces(input.request);
  if (!matches.length) return input;

  const excluded = new Set(input.excludedPlaceIds || []);
  const preferred = new Set(input.preferredPlaceIds || []);
  for (const closed of matches) {
    const replacement = closed.alternativePlaceIds.find(id => placeById.has(id) && !excluded.has(id));
    if (!replacement) continue;
    const existing = closed.alternativePlaceIds.find(id => preferred.has(id) && !excluded.has(id));
    // Bailian may have already resolved an explicit current merchant; keep that choice.
    // Local fallback can contain a generic category default, so the ranked closed-place replacement must still be added.
    if (!existing || input.intentSource !== "bailian") preferred.add(replacement);
  }
  return {
    ...input,
    preferredPlaceIds: [...preferred].filter(id => !excluded.has(id)),
    excludedPlaceIds: [...excluded]
  };
}
