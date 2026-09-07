import { redirect } from "next/navigation";
import Header from "@/app/components/header";
import AdjustEditor from "@/app/components/adjust-editor";
import { parseChanges, parseInput } from "@/lib/planner";
import { applyRemainingFields, journeyUrl, readJourney, replanRemaining } from "@/lib/journey";
export default async function AdjustPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams, input = parseInput(params);
  const original = readJourney(input, { ...params, changes: undefined, change: undefined });
  const initial = applyRemainingFields(original, params), changes = parseChanges(params);
  if (params.mode === "save") redirect(journeyUrl(input, replanRemaining(input, initial, changes).journey));
  return <><Header/><AdjustEditor key={JSON.stringify(params)} input={input} original={original} initial={initial} initialChanges={changes}/></>;
}
