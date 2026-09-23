import type { Budget, PlanInput } from "@/types";

function normalizeNumbers(text: string) {
  const digits = "零一二三四五六七八九";
  return text.replace(/[零〇一二两三四五六七八九十百千]+/g, word => {
    let total = 0;
    let digit = 0;
    for (const char of word.replace(/两/g, "二").replace(/〇/g, "零")) {
      const unit = ({ 十: 10, 百: 100, 千: 1000 } as Record<string, number>)[char];
      if (unit) { total += (digit || 1) * unit; digit = 0; }
      else digit = digit * 10 + digits.indexOf(char);
    }
    return String(total + digit);
  });
}

/** Exact constraints apply to both local parsing and validated AI output. */
export function applyRequestLimits(input: PlanInput): PlanInput {
  const text = normalizeNumbers(input.request);
  const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:个)?(半)?小时(半)?(?:\s*(\d+)\s*分钟?)?/);
  const minutes = text.match(/(\d+(?:\.\d+)?)\s*分钟?/);
  const duration = hours
    ? Number(hours[1]) * 60 + (hours[2] || hours[3] ? 30 : 0) + Number(hours[4] || 0)
    : /半(?:个)?小时/.test(text) ? 30
    : minutes ? Number(minutes[1])
    : /半天/.test(text) ? 240 : null;

  // Require a budget label or currency unit; a duration range is not money.
  const amount = text.match(/(?:预算|人均|花费)[^\d\-]{0,6}(\d+(?:\.\d+)?)(?:\s*[-到至~～]\s*(\d+(?:\.\d+)?))?/)
    || text.match(/(\d+(?:\.\d+)?)\s*[-到至~～]\s*(\d+(?:\.\d+)?)\s*元/);
  const limit = amount ? Math.min(10000, Math.floor(Number(amount[2] || amount[1]))) : null;
  const budget: Budget = limit === null ? input.budget
    : limit <= 100 ? "100" : limit <= 300 ? "300" : limit <= 500 ? "500" : "plus";

  return {
    ...input,
    duration: duration === null ? input.duration : Math.max(1, Math.min(480, Math.floor(duration))),
    budget,
    ...(limit === null ? {} : { budgetLimit: limit })
  };
}
