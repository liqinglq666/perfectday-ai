import type { Budget, PlanInput, Scene } from "@/types";

export type SceneCopy = { title: string; subtitle: string };

export const SCENE_COPY: Record<Scene, SceneCopy> = {
  date: { title: "约会 · 浪漫但不赶", subtitle: "把好逛、好聊和一顿舒服的饭放进同一条路线。" },
  family: { title: "亲子 · 轻松遛娃", subtitle: "让孩子有得玩，大人也不用一直赶路。" },
  parents: { title: "陪爸妈 · 舒适慢逛", subtitle: "少走路、多休息，把节奏放慢一点。" },
  friends: { title: "朋友聚会 · 城市轻松逛", subtitle: "好聊、好吃、好朋友，刚刚好的半日时光。" },
  solo: { title: "独处 · 给自己半天", subtitle: "按自己的喜好慢慢逛，把时间留给喜欢的地方。" },
  rain: { title: "雨天 · 室内自在逛", subtitle: "尽量走室内路线，不让天气打乱今天。" }
};

export const BUDGET_CAP: Record<Budget, number> = {
  "100": 100,
  "300": 300,
  "500": 500,
  plus: 800
};

export function budgetCap(input: PlanInput) {
  const limit = input.budgetLimit;
  return typeof limit === "number" && Number.isFinite(limit) && limit >= 0
    ? Math.min(BUDGET_CAP[input.budget], Math.floor(limit))
    : BUDGET_CAP[input.budget];
}

export const PLAN_TEMPLATES: Record<Scene, string[]> = {
  date: ["holiday-start", "boya-bookstore", "daka-coffee", "connector", "golden-food"],
  family: ["holiday-start", "boya-bookstore", "connector", "golden-family", "golden-food"],
  parents: ["holiday-start", "boya-bookstore", "daka-coffee", "connector", "golden-rest", "golden-food"],
  friends: ["boya-bookstore", "daka-coffee", "connector", "golden-food"],
  solo: ["boya-bookstore", "daka-coffee", "connector", "golden-shopping"],
  rain: ["boya-bookstore", "daka-coffee", "connector", "golden-shopping", "golden-food"]
};

export function isScene(value: unknown): value is Scene {
  return typeof value === "string" && Object.hasOwn(SCENE_COPY, value);
}

export function isBudget(value: unknown): value is Budget {
  return typeof value === "string" && Object.hasOwn(BUDGET_CAP, value);
}

export function isWalking(value: unknown): value is PlanInput["walking"] {
  return value === "normal" || value === "low";
}
