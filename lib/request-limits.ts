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

const CLAUSE_BOUNDARY = /[，,。；;！？!?\n]/;

function requestDuration(clauses: string[]): number | null {
  const candidates: Array<{ minutes: number; explicit: boolean }> = [];
  for (const clause of clauses) {
    const times = [...clause.matchAll(/(\d+(?:\.\d+)?)\s*(?:个)?(半)?小时(半)?(?:\s*(\d+)\s*分钟?)?|半(?:个)?小时|(\d+(?:\.\d+)?)\s*分钟?|半天/g)];
    for (let i = 0; i < times.length; i++) {
      const match = times[i];
      // Context belongs to this number, not a different duration in the sentence.
      const before = clause.slice(i ? times[i - 1].index! + times[i - 1][0].length : 0, match.index);
      const after = clause.slice(match.index! + match[0].length, times[i + 1]?.index).trimStart();
      const contexts = [...before.matchAll(/来回|往返|路上|路程|通勤|坐车|乘车|开车|车程|打车|公交|地铁|步行|排队|等待|等车|等人|等朋友|逛|游玩|游览|行程|停留|可用时间|玩|待在/g)];
      const context = contexts.at(-1)?.[0];
      const unrelated = /^(?:来回|往返|路上|路程|通勤|坐车|乘车|开车|车程|打车|公交|地铁|步行|排队|等待|等车|等人|等朋友)$/;
      if ((context && unrelated.test(context)) ||
        /^(?:的)?(?:车程|路程|通勤|坐车|乘车|开车|步行|排队|等待)/.test(after)) continue;
      const minutes = match[1] ? Number(match[1]) * 60 + (match[2] || match[3] ? 30 : 0) + Number(match[4] || 0)
        : match[5] ? Number(match[5]) : match[0] === "半天" ? 240 : 30;
      candidates.push({ minutes, explicit: Boolean(context) });
    }
  }
  return (candidates.find(candidate => candidate.explicit) || candidates[0])?.minutes ?? null;
}

function requestBudget(clauses: string[]): number | null {
  for (const clause of clauses) {
    // Only allow monetary qualifiers between a budget label and its amount.
    // In particular, "不限/没想好，逛两小时" must never supply a budget.
    const amount = clause.match(/(?:预算|人均(?:预算|花费)?|花费)\s*(?:(?:为|是|约|大约|大概|最多|不超过|不高于|上限|控制在|定在|在|只有|有|只剩|剩下|[:：￥¥])\s*)*(\d+(?:\.\d+)?)(?:\s*[-到至~～]\s*(\d+(?:\.\d+)?))?/)
      || clause.match(/^\s*(?:只有|最多|不超过)?\s*(\d+(?:\.\d+)?)(?:\s*[-到至~～]\s*(\d+(?:\.\d+)?))?\s*(?:元|块钱?)(?:以内|内|左右)?\s*$/);
    if (!amount) continue;
    const suffix = clause.slice(amount.index! + amount[0].length).trimStart();
    if (/^(?:[\d.个半]|小时|分钟?|天|周|月|年|公里|米)/.test(suffix)) continue;
    return Math.min(10000, Math.floor(Number(amount[2] || amount[1])));
  }
  return null;
}

/** Local fallback only: validated structured AI fields are already resolved. */
export function applyRequestLimits(input: PlanInput): PlanInput {
  if (input.intentSource === "bailian") return input;
  const clauses = normalizeNumbers(input.request).split(CLAUSE_BOUNDARY);
  const duration = requestDuration(clauses);
  const limit = requestBudget(clauses);
  const budget: Budget = limit === null ? input.budget
    : limit <= 100 ? "100" : limit <= 300 ? "300" : limit <= 500 ? "500" : "plus";

  return {
    ...input,
    duration: duration === null ? input.duration : Math.max(1, Math.min(480, Math.floor(duration))),
    budget,
    ...(limit === null ? {} : { budgetLimit: limit })
  };
}
