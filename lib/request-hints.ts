import { places } from "@/data/places";
import { applyRequestLimits } from "@/lib/request-limits";
import type { PlanInput, PlaceCategory, Scene } from "@/types";

const PLACE_MENTIONS: Array<[string, string[]]> = [
  ["书店|阅读|文创", ["boya-bookstore"]],
  ["糖水|甜品|珠珑入水", ["holiday-dessert"]],
  ["亲子乐园|儿童乐园|嗨贝天地", ["golden-family"]],
  ["咖啡", ["daka-coffee"]],
  ["瑞幸", ["luckin-coffee"]],
  ["优衣库|UNIQLO|衣服|服装", ["holiday-uniqlo"]],
  ["大家乐|简餐|快餐", ["holiday-cafe-de-coral"]],
  ["运动|台球|保龄|射箭|游戏|主机|VR|互动|潮玩馆", ["dayu-player"]],
  ["泡泡玛特|盲盒", ["popmart"]],
  ["宜得利|家居|家装|生活方式店", ["nitori"]],
  ["盒马|超市|生鲜|买菜|伴手礼", ["hema"]],
  ["酸菜鱼|太二", ["golden-food"]],
  ["臻龙|臻龍|葡式|茶餐厅|茶餐廳", ["golden-zhenlong"]],
  ["龙发|龍發|鸡煲|雞煲", ["golden-longfa"]],
  ["味千|拉面|拉麵", ["holiday-ajisen"]]
];

const CATEGORY_NEGATIONS: Array<[string, PlaceCategory]> = [
  ["咖啡", "coffee"],
  ["糖水|甜品", "dessert"],
  ["吃饭|晚餐|晚饭|餐厅", "food"],
  ["购物|逛店", "shopping"]
];

function inferScene(text: string, fallback: Scene): Scene {
  if (/孩子|小朋友|宝宝|亲子|遛娃/.test(text)) return "family";
  if (/爸妈|父母|长辈|老人|爷爷|奶奶/.test(text)) return "parents";
  if (/女朋友|男朋友|对象|情侣|约会|浪漫/.test(text)) return "date";
  if (/一个人|独处|自己逛|自己玩/.test(text)) return "solo";
  if (/朋友|同学|聚会|闺蜜|兄弟/.test(text)) return "friends";
  return fallback;
}

function inferWalking(text: string, fallback: PlanInput["walking"]) {
  return /少走|不想走|走不动|别太累|轻松一点|少步行/.test(text) ? "low" : fallback;
}

function isNegative(text: string, pattern: string) {
  return new RegExp(`(?:不(?:想|要|用|去|喝|吃|逛|玩)*|别|避开)[^，。；！？,;!?\\n]{0,6}(?:${pattern})`, "i").test(text);
}

export function applyRequestHints(rawInput: PlanInput): PlanInput {
  const input = rawInput.intentSource === "bailian" ? rawInput : applyRequestLimits(rawInput);
  const text = input.request.trim();
  // Trust validated semantics, including negations and cuisine synonyms. Only an
  // explicit generic-meal classification can discard AI restaurant candidates.
  if (input.intentSource === "bailian") {
    return {
      ...input,
      preferredPlaceIds: (input.preferredPlaceIds || []).filter(id =>
        !input.excludedPlaceIds?.includes(id) &&
        (input.mealIntent !== "generic" || places.find(item => item.id === id)?.category !== "food"))
    };
  }
  if (!text) return input;
  const rainy = text.split(/[，,。；;！？!?\n]/).some(clause => {
    const weather = clause.replace(/(?:不(?:会|再)?|没(?:有)?|无|不是)(?:再)?(?:下雨|雨天|雨)/g, "");
    return /下雨|雨天/.test(weather);
  });
  const indoorOnly = input.indoorOnly || input.scene === "rain" || rainy ||
    /只想室内|尽量[^，,。；;！？!?\n]*室内|室内为主|不去室外|在室内/.test(text);

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

  if (preferred.has("luckin-coffee")) preferred.delete("daka-coffee");
  if (preferred.has("holiday-cafe-de-coral")) preferred.delete("golden-food");

  return {
    ...input,
    scene: inferScene(text, input.scene),
    walking: inferWalking(text, input.walking),
    preferredPlaceIds: [...preferred].filter((id) => !excluded.has(id)),
    excludedPlaceIds: [...excluded],
    indoorOnly
  };
}
