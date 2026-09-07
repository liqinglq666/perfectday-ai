import type { Place } from "@/types";

/**
 * Reviewed MixC-side meal candidates added only to improve same-mall fallback and queue handling.
 * Public listings were checked on 2026-09-07; they are not real-time queue or opening guarantees.
 */
export const mealCandidates: Place[] = [
  {
    id: "golden-zhenlong",
    name: "臻龙澳门葡式茶餐厅（中山石岐万象汇店）",
    mall: "完美金鹰 · 石岐万象汇",
    floor: "L1 · L163",
    address: "中山市石岐街道孙文东路28号中山石岐万象汇L1层L163",
    category: "food",
    tags: ["date", "family", "parents", "friends", "solo", "rain"],
    duration: 50,
    price: 55,
    indoor: true,
    walkMinutes: 3,
    note: "适合作为正餐或排队时的同商场备选；人均55元仅为路线预算估算，实际菜单、价格与营业情况以门店为准。",
    icon: "♨",
    accent: "orange",
    visual: "/visuals/dining.svg",
    evidenceStatus: "online_listing",
    locationPrecision: "exact",
    checkedAt: "2026-09-07",
    searchKeyword: "臻龙澳门葡式茶餐厅 中山石岐万象汇",
    sourceLabel: "HKT 中山石岐万象汇优惠页 · 2026",
    evidenceNote: "2026年全年优惠页明确列出L163店铺；不代表实时排队或营业状态。",
    sourceUrl: "https://www.hkt.com/assets/HKTCorpsite/files/consumer/zhongshan-shiqi-mixc/zh.html"
  },
  {
    id: "golden-longfa",
    name: "龙发鸡煲（中山石岐万象汇店）",
    mall: "完美金鹰 · 石岐万象汇",
    floor: "L4 · L405",
    address: "中山市石岐街道孙文东路28号中山石岐万象汇L4层L405",
    category: "food",
    tags: ["date", "family", "parents", "friends", "rain"],
    duration: 60,
    price: 75,
    indoor: true,
    walkMinutes: 4,
    note: "适合作为聚餐或主餐备选；人均75元仅为路线预算估算，实际菜单、价格与营业情况以门店为准。",
    icon: "♨",
    accent: "orange",
    visual: "/visuals/dining.svg",
    evidenceStatus: "online_listing",
    locationPrecision: "exact",
    checkedAt: "2026-09-07",
    searchKeyword: "龙发鸡煲 中山石岐万象汇",
    sourceLabel: "HKT 中山石岐万象汇优惠页 · 2026",
    evidenceNote: "2026年全年优惠页明确列出L405店铺；不代表实时排队或营业状态。",
    sourceUrl: "https://www.hkt.com/assets/HKTCorpsite/files/consumer/zhongshan-shiqi-mixc/zh.html"
  }
];
