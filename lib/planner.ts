import { places } from "@/data/places";
import type { AdjustmentChange, Budget, PlanInput, Place, Scene, TripPlan, TripStop } from "@/types";

const sceneCopy: Record<Scene, { title: string; subtitle: string }> = {
  date: { title: "约会 · 浪漫但不赶", subtitle: "把好逛、好聊和一顿舒服的饭放进同一条路线。" },
  family: { title: "亲子 · 轻松遛娃", subtitle: "让孩子有得玩，大人也不用一直赶路。" },
  parents: { title: "陪爸妈 · 舒适慢逛", subtitle: "少走路、多休息，把节奏放慢一点。" },
  friends: { title: "朋友聚会 · 城市轻松逛", subtitle: "好聊、好吃、好朋友，刚刚好的半日时光。" },
  solo: { title: "独处 · 给自己半天", subtitle: "按自己的喜好慢慢逛，把时间留给喜欢的地方。" },
  rain: { title: "雨天 · 室内自在逛", subtitle: "尽量走室内路线，不让天气打乱今天。" }
};

const budgetCap: Record<Budget, number> = { "100": 100, "300": 300, "500": 500, plus: 800 };

export function isScene(value: unknown): value is Scene {
  return typeof value === "string" && Object.hasOwn(sceneCopy, value);
}

export function isBudget(value: unknown): value is Budget {
  return typeof value === "string" && Object.hasOwn(budgetCap, value);
}

export function isWalking(value: unknown): value is PlanInput["walking"] {
  return value === "normal" || value === "low";
}

const templates: Record<Scene, string[]> = {
  date: ["holiday-start", "boya-bookstore", "daka-coffee", "connector", "golden-food"],
  family: ["holiday-start", "boya-bookstore", "connector", "golden-family", "golden-food"],
  parents: ["holiday-start", "boya-bookstore", "daka-coffee", "connector", "golden-rest", "golden-food"],
  friends: ["holiday-start", "boya-bookstore", "daka-coffee", "connector", "golden-food"],
  solo: ["boya-bookstore", "daka-coffee", "connector", "golden-shopping"],
  rain: ["boya-bookstore", "daka-coffee", "connector", "golden-shopping", "golden-food"]
};

function byId(id: string): Place {
  const place = places.find((item) => item.id === id);
  if (!place) throw new Error(`Unknown place: ${id}`);
  return place;
}

function toClock(totalMinutes: number) {
  const start = 14 * 60;
  const value = start + totalMinutes;
  const hour = Math.floor(value / 60) % 24;
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

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
  const normalized = text.replace(/[一二两三四五六七八]/g, (digit) => String("一二三四五六七八".indexOf(digit === "两" ? "二" : digit) + 1));
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(?:个)?(半)?小时/);
  const hours = match ? Number(match[1]) + (match[2] || /小时半/.test(normalized) ? 0.5 : 0) : /半天/.test(text) ? 4 : null;
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

function applyRequestHints(input: PlanInput): PlanInput {
  if (input.intentSource === "bailian") return input;
  const text = input.request.trim();
  if (!text) return input;
  const mentions: [string, string[]][] = [
    ["书店|阅读|文创", ["boya-bookstore"]],
    ["咖啡", ["daka-coffee"]],
    ["瑞幸", ["luckin-coffee"]],
    ["星巴克", ["golden-coffee"]],
    ["运动|台球|保龄|射箭|游戏|主机|VR|互动|潮玩馆", ["dayu-player"]],
    ["泡泡玛特|盲盒", ["popmart"]],
    ["宜得利|家居|家装|生活方式店", ["nitori"]],
    ["盒马|超市|生鲜|买菜|伴手礼", ["hema"]],
    ["吃饭|晚餐|晚饭|酸菜鱼|太二", ["golden-food"]]
  ];
  const excluded = new Set(input.excludedPlaceIds || []);
  const preferred = new Set(input.preferredPlaceIds || []);
  const negative = (pattern: string) => new RegExp(`(?:不(?:想|要|用|去|喝|吃|逛|玩)*|别|避开)[^，。；！？,;!?\\n]{0,6}(?:${pattern})`, "i").test(text);
  for (const [pattern, ids] of mentions) {
    if (negative(pattern)) ids.forEach((id) => excluded.add(id));
    else if (new RegExp(pattern, "i").test(text)) ids.forEach((id) => preferred.add(id));
  }
  for (const [pattern, category] of [["咖啡", "coffee"], ["吃饭|晚餐|晚饭|餐厅", "food"], ["购物|逛店", "shopping"]]) {
    if (negative(pattern)) places.filter((place) => place.category === category).forEach((place) => excluded.add(place.id));
  }
  if (preferred.has("luckin-coffee") || preferred.has("golden-coffee")) preferred.delete("daka-coffee");
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

function insertBeforeFood(items: Place[], place: Place) {
  if (items.some((item) => item.id === place.id)) return items;
  const foodIndex = items.findIndex((item) => item.category === "food");
  const next = [...items];
  next.splice(foodIndex >= 0 ? foodIndex : next.length, 0, place);
  return next;
}

function applyResolvedPlaces(items: Place[], input: PlanInput) {
  const excluded = new Set(input.excludedPlaceIds || []);
  let result = items.filter((item) => !excluded.has(item.id));
  for (const id of input.preferredPlaceIds || []) {
    const place = places.find((item) => item.id === id);
    if (!place || excluded.has(id) || result.some((item) => item.id === id)) continue;
    const sameCategory = result.findIndex((item) => item.category === place.category &&
      !input.preferredPlaceIds?.includes(item.id));
    if (sameCategory >= 0) result[sameCategory] = place;
    else result = insertBeforeFood(result, place);
  }
  if (input.indoorOnly || input.scene === "rain") result = result.filter((item) => item.indoor);
  return result;
}

function orderByMall(items: Place[]) {
  const holiday = items.filter((item) => item.mall === "假日广场");
  const golden = items.filter((item) => item.mall !== "假日广场" && item.category !== "connector");
  const connector = items.find((item) => item.category === "connector");
  return [...holiday, ...(holiday.length && golden.length ? [connector || byId("connector")] : []), ...golden];
}

function withinLimits(items: Place[], input: PlanInput) {
  let result = orderByMall(items);
  const preferred = new Set(input.preferredPlaceIds || []);
  while (result.length && (result.reduce((sum, item) => sum + item.price, 0) > budgetCap[input.budget] ||
    result.reduce((sum, item) => sum + item.duration + item.walkMinutes, 0) > input.duration)) {
    const candidates = result.map((item, index) => ({ item, index }))
      .filter(({ item }) => item.category !== "connector")
      .sort((a, b) => {
        const priority = (item: Place) => preferred.has(item.id) ? 100 : item.category === "start" ? -1 :
          item.category === "family" && input.scene === "family" ? 20 :
          item.category === "rest" && input.scene === "parents" ? 10 : 0;
        return priority(a.item) - priority(b.item) || b.index - a.index;
      });
    if (!candidates.length) return [];
    result.splice(candidates[0].index, 1);
    result = orderByMall(result);
  }
  return result;
}

// Fewer mall changes reduce walking without inventing shorter travel times.
function oneMall<T extends Place>(items: T[], preferred: string[] = [], scene?: Scene): T[] {
  const groups = [items.filter((item) => item.mall === "假日广场"),
    items.filter((item) => item.mall !== "假日广场" && item.category !== "connector")];
  const score = (group: T[]) => group.reduce((sum, item) => sum +
    (preferred.includes(item.id) ? 100 : item.category === "family" && scene === "family" ? 20 : 1), 0);
  return groups.sort((a, b) => score(b) - score(a))[0];
}

function summarize(items: Place[], copy: { title: string; subtitle: string }): TripPlan {
  let elapsed = 0;
  const stops: TripStop[] = orderByMall(items).map((item) => {
    const stop = { ...item, time: toClock(elapsed) };
    elapsed += item.duration + item.walkMinutes;
    return stop;
  });
  return {
    ...copy,
    subtitle: stops.length ? copy.subtitle : "当前地点库没有符合这些条件的安排，请放宽条件后重新规划。",
    stops,
    totalMinutes: elapsed,
    totalPrice: stops.reduce((sum, item) => sum + item.price, 0),
    totalWalkMinutes: stops.reduce((sum, item) => sum + item.walkMinutes, 0)
  };
}

export function createPlan(rawInput: PlanInput): TripPlan {
  const input = applyRequestHints(rawInput);
  let selected = applyResolvedPlaces(templates[input.scene].map(byId), input);
  if (input.excludedPlaceIds?.includes("connector")) selected = oneMall(selected, input.preferredPlaceIds, input.scene);
  if (input.walking === "low") {
    const preferredMalls = new Set(selected.filter((item) => input.preferredPlaceIds?.includes(item.id)).map((item) => item.mall));
    if (preferredMalls.size <= 1) selected = oneMall(selected, input.preferredPlaceIds, input.scene);
  }
  return summarize(withinLimits(selected, input), sceneCopy[input.scene]);
}

export function adjustPlan(rawInput: PlanInput, change: AdjustmentChange | AdjustmentChange[]): TripPlan {
  const input = applyRequestHints(rawInput);
  const base = createPlan(input);
  const changes = new Set(Array.isArray(change) ? change : [change]);
  let stops: TripStop[] = base.stops.map((stop) => ({ ...stop, status: "kept" }));
  if (changes.has("rain")) stops = stops.filter((stop) => stop.indoor);
  if (changes.has("walk")) stops = oneMall(stops, input.preferredPlaceIds, input.scene);
  if (changes.has("queue")) {
    stops = stops.map((stop) => stop.category === "food" ? {
      ...stop,
      name: "石岐万象汇 · 餐饮区现场备选",
      searchKeyword: "中山石岐万象汇 餐饮",
      price: Math.min(stop.price, 90),
      status: "replaced" as const,
      note: "在餐饮区现场比较排队情况，自选等待较短的门店；这里不代表实时推荐。",
      sourceLabel: "商圈公共区域",
      sourceUrl: "https://www.zsnews.cn/trade/index/view/cateid/45/id/698538.html"
    } : stop);
  }
  if (changes.has("budget")) {
    const paid = [...stops].filter((stop) => stop.price > 0)
      .sort((a, b) => Number(input.preferredPlaceIds?.includes(a.id) || false) - Number(input.preferredPlaceIds?.includes(b.id) || false) || b.price - a.price)[0];
    if (paid) stops = stops.filter((stop) => stop.id !== paid.id);
  }
  return summarize(stops, base);
}

export function parseChanges(params: Record<string, string | string[] | undefined>): AdjustmentChange[] {
  const raw = typeof params.changes === "string" ? params.changes : typeof params.change === "string" ? params.change : "";
  return [...new Set(raw.slice(0, 100).split(",").map(parseChange).filter((value): value is AdjustmentChange => value !== null))];
}

export function changeQuery(changes: AdjustmentChange[]) {
  return changes.length ? `&changes=${changes.join(",")}` : "";
}

export function describeChanges(base: TripPlan, plan: TripPlan) {
  const removed = base.stops.filter((stop) => stop.category !== "connector" && !plan.stops.some((item) => item.id === stop.id)).length;
  const savings = base.totalPrice - plan.totalPrice;
  const walking = base.totalWalkMinutes - plan.totalWalkMinutes;
  const details = [removed ? `减少 ${removed} 个停留点` : "", savings > 0 ? `预计节省 ¥${savings}` : "", walking > 0 ? `少走约 ${walking} 分钟` : "",
    plan.stops.some((stop) => stop.status === "replaced") ? "餐厅改为现场备选" : ""].filter(Boolean);
  return details.length ? details.join(" · ") : "当前路线已符合这些条件，无需额外调整。";
}

export function parseInput(params: Record<string, string | string[] | undefined>, inferRequest = true): PlanInput {
  const value = (key: string, fallback: string) => {
    const raw = params[key];
    return typeof raw === "string" ? raw : fallback;
  };

  const scene = value("scene", "friends");
  const duration = Number(value("duration", "240"));
  const budget = value("budget", "500");
  const walking = value("walking", "low");
  const source = value("ai", "");
  const ids = (key: string) => [...new Set(value(key, "").slice(0, 600).split(","))]
    .filter((id) => places.some((place) => place.id === id));
  const input: PlanInput = {
    request: value("request", "").slice(0, 600),
    scene: isScene(scene) ? scene : "friends",
    duration: Number.isFinite(duration) ? Math.max(90, Math.min(480, Math.round(duration))) : 240,
    budget: isBudget(budget) ? budget : "500",
    walking: isWalking(walking) ? walking : "low",
    ...(source === "bailian" ? {
      intentSource: "bailian" as const,
      preferredPlaceIds: ids("preferred"),
      excludedPlaceIds: ids("excluded"),
      indoorOnly: value("indoor", "0") === "1"
    } : source === "fallback" ? { intentSource: "fallback" as const } : {})
  };
  return inferRequest ? applyRequestHints(input) : input;
}

export function parseChange(value: string | string[] | undefined): AdjustmentChange | null {
  if (typeof value !== "string") return null;
  return ["rain", "walk", "budget", "queue"].includes(value) ? value as AdjustmentChange : null;
}

export function queryString(input: PlanInput) {
  const params = new URLSearchParams({
    request: input.request,
    scene: input.scene,
    duration: String(input.duration),
    budget: input.budget,
    walking: input.walking
  });
  if (input.intentSource) params.set("ai", input.intentSource);
  if (input.intentSource === "bailian") {
    if (input.preferredPlaceIds?.length) params.set("preferred", input.preferredPlaceIds.join(","));
    if (input.excludedPlaceIds?.length) params.set("excluded", input.excludedPlaceIds.join(","));
    if (input.indoorOnly) params.set("indoor", "1");
  }
  return params.toString();
}
