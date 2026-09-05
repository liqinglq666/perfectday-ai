import { places } from "@/data/places";
import type { AdjustmentChange, Budget, PlanInput, Place, Scene, TripPlan, TripStop } from "@/types";

const sceneCopy: Record<Scene, { title: string; subtitle: string }> = {
  date: { title: "约会 · 浪漫但不赶", subtitle: "把好逛、好聊和一顿舒服的饭放进同一条路线。" },
  family: { title: "亲子 · 轻松遛娃", subtitle: "让孩子有得玩，大人也不用一直赶路。" },
  parents: { title: "陪爸妈 · 舒适慢逛", subtitle: "少走路、多休息，把节奏放慢一点。" },
  friends: { title: "朋友聚会 · 城市轻松逛", subtitle: "好聊、好吃、好朋友，刚刚好的半日时光。" },
  solo: { title: "独处 · 给自己半天", subtitle: "书店、咖啡与自由闲逛，一个人也可以很完整。" },
  rain: { title: "雨天 · 室内自在逛", subtitle: "尽量走室内路线，不让天气打乱今天。" }
};

const budgetCap: Record<Budget, number> = { "100": 100, "300": 300, "500": 500, plus: 800 };

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

function fitBudget(items: Place[], cap: number) {
  const result = [...items];
  const total = () => result.reduce((sum, item) => sum + item.price, 0);

  while (total() > cap && result.length > 3) {
    let candidateIndex = -1;
    let candidatePrice = -1;

    result.forEach((item, index) => {
      if (item.price > candidatePrice && item.category !== "start" && item.category !== "connector") {
        candidateIndex = index;
        candidatePrice = item.price;
      }
    });

    if (candidateIndex < 0) break;
    result.splice(candidateIndex, 1);
  }

  return result;
}

function fitDuration(items: Place[], duration: number) {
  let elapsed = 0;
  const result: Place[] = [];

  for (const item of items) {
    const next = elapsed + item.duration + item.walkMinutes;
    if (next > duration && result.length >= 3) break;
    result.push(item);
    elapsed = next;
  }

  return result;
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
  const match = text.match(/(\d(?:\.\d)?)\s*(?:个)?小时/);
  if (!match) return fallback;
  const hours = Number(match[1]);
  return Number.isFinite(hours) ? Math.max(90, Math.min(480, Math.round(hours * 60))) : fallback;
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
  const text = input.request.trim();
  if (!text) return input;

  return {
    ...input,
    scene: inferScene(text, input.scene),
    duration: inferDuration(text, input.duration),
    budget: inferBudget(text, input.budget),
    walking: inferWalking(text, input.walking)
  };
}

export function createPlan(rawInput: PlanInput): TripPlan {
  const input = applyRequestHints(rawInput);
  const copy = sceneCopy[input.scene];
  let selected = templates[input.scene].map(byId);

  if (input.walking === "low") {
    selected = selected.map((item) => item.id === "connector"
      ? { ...item, duration: 10, walkMinutes: 5, note: "优先走已打通的连通区域，减少绕行和无效步行。" }
      : item);
  }

  selected = fitBudget(selected, budgetCap[input.budget]);
  selected = fitDuration(selected, input.duration);

  let elapsed = 0;
  const stops: TripStop[] = selected.map((item) => {
    const stop = { ...item, time: toClock(elapsed) };
    elapsed += item.duration + item.walkMinutes;
    return stop;
  });

  return {
    title: copy.title,
    subtitle: input.request.trim() ? `已理解：${input.request.trim()} · ${copy.subtitle}` : copy.subtitle,
    stops,
    totalMinutes: elapsed,
    totalPrice: stops.reduce((sum, item) => sum + item.price, 0),
    totalWalkMinutes: stops.reduce((sum, item) => sum + item.walkMinutes, 0)
  };
}

export function adjustPlan(input: PlanInput, change: AdjustmentChange): TripPlan {
  const base = createPlan(input);
  let stops: TripStop[] = base.stops.map((stop) => ({ ...stop, status: "kept" }));

  if (change === "rain") {
    stops = stops
      .filter((stop) => stop.indoor || stop.category === "connector")
      .map<TripStop>((stop) => ({
        ...stop,
        status: stop.category === "connector" ? "shortened" : "kept"
      }));
  }

  if (change === "walk") {
    stops = stops.map<TripStop>((stop) => stop.category === "connector"
      ? { ...stop, duration: 8, walkMinutes: 4, status: "shortened", note: "继续通过连通区域前往下一站，尽量减少绕行。" }
      : stop);
  }

  if (change === "budget") {
    const paid = stops
      .map((stop, index) => ({ stop, index }))
      .filter(({ stop }) => stop.price > 0 && stop.category !== "food")
      .sort((a, b) => b.stop.price - a.stop.price)[0];

    if (paid) stops = stops.filter((_, index) => index !== paid.index);
  }

  if (change === "queue") {
    stops = stops.map<TripStop>((stop) => stop.category === "food"
      ? {
          ...stop,
          name: "石岐万象汇 · 餐饮区现场备选",
          floor: "餐饮楼层",
          address: "中山市石岐区孙文东路28号中山石岐万象汇",
          price: 90,
          status: "replaced",
          verified: true,
          sourceLabel: "商圈公共区域",
          sourceUrl: "https://www.zsnews.cn/trade/index/view/cateid/45/id/698538.html",
          note: "MVP 不伪造实时排队数据：如果当前餐厅排队过久，改为到商场餐饮区现场选择无需久等的门店。"
        }
      : stop);
  }

  let elapsed = 0;
  stops = stops.map<TripStop>((stop) => {
    const next = { ...stop, time: toClock(elapsed) };
    elapsed += stop.duration + stop.walkMinutes;
    return next;
  });

  return {
    ...base,
    stops,
    totalMinutes: elapsed,
    totalPrice: stops.reduce((sum, stop) => sum + stop.price, 0),
    totalWalkMinutes: stops.reduce((sum, stop) => sum + stop.walkMinutes, 0)
  };
}

export function parseInput(params: Record<string, string | string[] | undefined>): PlanInput {
  const value = (key: string, fallback: string) => {
    const raw = params[key];
    return typeof raw === "string" ? raw : fallback;
  };

  return applyRequestHints({
    request: value("request", ""),
    scene: value("scene", "friends") as Scene,
    duration: Number(value("duration", "240")),
    budget: value("budget", "500") as Budget,
    walking: value("walking", "low") as PlanInput["walking"]
  });
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
  return params.toString();
}
