import { clockText, type Journey } from "@/lib/journey";

export interface AdjustmentFields {
  left: string;
  cash: string;
  from: string;
  current: string;
}

export function adjustmentFieldsFromJourney(journey: Journey): AdjustmentFields {
  return {
    left: String(journey.minutes),
    cash: String(journey.cash),
    from: clockText(journey.clock),
    current: journey.current
  };
}

export function isValidAdjustmentFields(values: AdjustmentFields) {
  return /^\d+$/.test(values.left) && Number(values.left) <= 480 &&
    /^\d+$/.test(values.cash) && Number(values.cash) <= 10000 &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(values.from);
}
