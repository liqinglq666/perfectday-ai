import { places } from "@/data/places";
import type { Budget, PlanInput, PlaceCategory, Scene } from "@/types";

const PLACE_MENTIONS: Array<[string, string[]]> = [
  ["书店|阅读|文创", ["boya-bookstore"]],
  ["糖水|甜品|珠珑入水", ["holiday-dessert"]],
  ["咖啡", ["daka-coffee"]],
  ["瑞幸", ["luckin-coffee"]],
  ["优衣库|UNIQLO|衣服|服装", ["holiday-uniqlo"]],
  ["大家乐|简餐|快餐", ["holiday-cafe-de-coral"]],
  ["运动|台球|保龄|射箭|游戏|主机|VR|互动|潮玩馆", ["dayu-player"]],
  ["泡泡玛特|盲盒", ["popmart"]],
  ["宜得利|家居|家装|生活方式店", ["nitori"]],
  ["盒马|超市|生鲜|买菜|伴手礼", ["hema"]],
  ["酸菜鱼|太二", ["golden-food"]],
  ["臻龙|臻龍", ["golden-zhenlong"]],
  ["龙发|龍發", ["golden-longfa"]],
  ["味千", ["holiday-ajisen"]]
];

const CATEGORY_NEGATIONS: Array<[string, PlaceCategory]> = [
  ["咖啡", "coffee"],
  ["吃饭|晚餐|晚饭|餐厅", "food"],
  ["购物|逛店", "shopping"]
];

function inferScene(text: string, fallback: Scene): Scene {
  if (/下雨|雨天|只想室内|室内为主/.test(text)) return "rain";
  if (/孩子|小朋友|宝宝|亲子|遛娃/.test(text)) return "family";
  if (/爸妈|父母|长辈|老人|爷爷|奶奶/.test(text)) return "parents";
  if (/女朋友|男朋友|对象|情侣|约会|浪漫/.test(text)) return "date";
  if (/一个人|独处|自己逛|自己玩/.test(text)) return "solo";
  if (/朋友|同学|聚会|闺蜜|兄弟/.test(text)) return "friends";
  return fallback;
}

function inferDuration(text: string, fallback: number) {
  const digits = "一二三四五六七八";
  const normalized = text.replace(/[一二两三四五六七八]/g, (digit) =>
    String(digits.indexOf(digit === "两" ? "二" : digit) + 1));
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(?:个)?(半)?小时/);
  const hours = match
    ? Number(match[1]) + (match[2] || /小时半/.test(normalized) ? 0.5 : 0)
    : /半天/.test(text) ? 4 : null;
  return hours === null ? fallback : Math.max(90, Math.min(480, Math.round(hours * 60)));
}

function inferBudget(text: string, fallback: Budget): Budget {
  const range = text.match(/(?:预算|人均|花费)?[^\d]{0,6}(\d{2,4})\s*[-到至~～]\s*(\d{2,4})/);
  const single = text.match(/(?:预算|人均|花费)[^\d]{0,6}(\d{2,4})/);
  const value = range ? Number(range[2]) : single ? Number(single[1]) : null;
  if (value === null || Number.isNaN(value)) return fallback;
  if (value <= 100) return "100";
  if (value <= 300) return "300";
  if (value <= 500) return "500";
  return "plus";
}

function inferWalking(text: string, fallback: PlanInput["walking"]) {
  return /少走|不想走|走不动|别太累|轻松一点|少步行/.test(text) ? "low" : fallback;
}

function isNegative(text: string, pattern: string) {
  return new RegExp(`(?:不(?:想|要|用|去|喝|吃|逛|玩)*|别|避开)[^，。；！？,;!?\\n]{0,6}(?:${pattern})`, "i").test(text);
}

export function applyRequestHints(input: PlanInput): PlanInput {
  // Generic dinner requests are a route role, not a mandate to visit every AI candidate.
  // A named meal preference may cross malls; unnamed alternatives stay with local constraints.
  if (input.intentSource === "bailian") {
    const mealNames: Record<string, RegExp> = {
      "golden-food": /太二|酸菜鱼/i,
      "golden-zhenlong": /臻龙|臻龍/i,
      "golden-longfa": /龙发|龍發/i,
      "holiday-cafe-de-coral": /大家乐|大家樂|簡餐|简餐|快餐/i,
      "holiday-ajisen": /味千/i
    };
    return { ...input, preferredPlaceIds: (input.preferredPlaceIds || []).filter(id => {
      const place = places.find(item => item.id === id);
      return place?.category !== "food" || mealNames[id]?.test(input.request);
    }) };
  }
  const text = input.request.trim();
  if (!text) return input;

  const excluded = new Set(input.excludedPlaceIds || []);
  const preferred = new Set(input.preferredPlaceIds || []);

  for (const [pattern, ids] of PLACE_MENTIONS) {
    if (isNegative(text, pattern)) ids.forEach((id) => excluded.add(id));
    else if (new RegExp(pattern, "i").test(text)) ids.forEach((id) => preferred.add(id));
  }

  for (const [pattern, category] of CATEGORY_NEGATIONS) {
    if (isNegative(text, pattern)) {
      places.filter((place) => place.category === category).forEach((place) => excluded.add(place.id));
    }
  }

  if (/(?:只(?:逛|去|待在|留在)[^，。；！？]{0,8}假日广场|不(?:想)?去[^，。；！？]{0,6}(?:万象汇|完美金鹰))/.test(text)) {
    places.filter((place) => place.mall !== "假日广场" && place.category !== "connector")
      .forEach((place) => excluded.add(place.id));
    excluded.add("connector");
  }

  if (/(?:只(?:逛|去|待在|留在)[^，。；！？]{0,8}(?:万象汇|完美金鹰)|不(?:想)?去[^，。；！？]{0,6}假日广场)/.test(text)) {
    places.filter((place) => place.mall === "假日广场").forEach((place) => excluded.add(place.id));
    excluded.add("connector");
  }

  if (preferred.has("luckin-coffee") || preferred.has("holiday-dessert")) preferred.delete("daka-coffee");
  if (preferred.has("holiday-cafe-de-coral")) preferred.delete("golden-food");

  return {
    ...input,
    scene: inferScene(text, input.scene),
    duration: inferDuration(text, input.duration),
    budget: inferBudget(text, input.budget),
    walking: inferWalking(text, input.walking),
    preferredPlaceIds: [...preferred].filter((id) => !excluded.has(id)),
    excludedPlaceIds: [...excluded],
    indoorOnly: input.indoorOnly || /只想室内|尽量.*室内|室内为主|不去室外/.test(text)
  };
}
