import { places } from "@/data/places";
import type { Budget, PlanInput, Place, Scene, TripPlan, TripStop } from "@/types";

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
  date: ["holiday-start", "holiday-culture", "holiday-coffee", "connector", "golden-food"],
  family: ["holiday-start", "holiday-family", "holiday-coffee", "connector", "golden-food"],
  parents: ["holiday-start", "holiday-coffee", "connector", "golden-rest", "golden-food"],
  friends: ["holiday-start", "holiday-culture", "holiday-coffee", "connector", "golden-food"],
  solo: ["holiday-start", "holiday-culture", "holiday-coffee", "connector", "golden-shopping"],
  rain: ["holiday-culture", "holiday-coffee", "connector", "golden-shopping", "golden-food"]
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
  const total = items.reduce((sum, item) => sum + item.price, 0);
  if (total <= cap) return items;
  return items.map((item) => item.category === "shopping" ? { ...item, price: 20 } : item);
}

function fitDuration(items: Place[], duration: number) {
  let elapsed = 0;
  const result: Place[] = [];
  for (const item of items) {
    if (elapsed + item.duration + item.walkMinutes > duration && result.length >= 3) break;
    result.push(item);
    elapsed += item.duration + item.walkMinutes;
  }
  return result;
}

export function createPlan(input: PlanInput): TripPlan {
  const copy = sceneCopy[input.scene];
  let selected = templates[input.scene].map(byId);

  if (input.walking === "low") {
    selected = selected.map((item) => item.id === "connector" ? { ...item, duration: 12, walkMinutes: 6, note: "优先选择连通区域，减少不必要的绕行。" } : item);
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
    subtitle: input.request.trim() ? `“${input.request.trim()}” · ${copy.subtitle}` : copy.subtitle,
    stops,
    totalMinutes: Math.min(elapsed, input.duration),
    totalPrice: stops.reduce((sum, item) => sum + item.price, 0),
    totalWalkMinutes: stops.reduce((sum, item) => sum + item.walkMinutes, 0)
  };
}

export function adjustPlan(input: PlanInput, change: string): TripPlan {
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
      ? { ...stop, duration: 10, walkMinutes: 5, status: "shortened" }
      : stop);
  }

  if (change === "budget") {
    stops = stops.map<TripStop>((stop) => stop.category === "food" || stop.category === "coffee"
      ? { ...stop, price: Math.round(stop.price * 0.72), status: "replaced", note: "切换为更高性价比的同类选择。" }
      : stop);
  }

  if (change === "queue") {
    stops = stops.map<TripStop>((stop) => stop.category === "food"
      ? { ...stop, name: "金鹰亚洲 · 就近餐饮备选", price: 90, status: "replaced", note: "避开当前排队点，优先选择附近无需久等的餐饮区域。" }
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

  return {
    request: value("request", ""),
    scene: value("scene", "friends") as Scene,
    duration: Number(value("duration", "240")),
    budget: value("budget", "500") as Budget,
    walking: value("walking", "low") as PlanInput["walking"]
  };
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
