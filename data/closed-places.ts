export type ClosedPlaceCategory = "coffee" | "food";

export interface ClosedPlace {
  id: string;
  name: string;
  mall: "完美金鹰 · 石岐万象汇";
  category: ClosedPlaceCategory;
  aliases: string[];
  closedAt: string;
  closureLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  alternativePlaceIds: string[];
}

/**
 * Closed merchants are never route candidates.
 * They exist only to explain stale user requests and redirect them to current reviewed candidates.
 */
export const closedPlaces: ClosedPlace[] = [
  {
    id: "closed-tims-shiqi",
    name: "Tims 天好咖啡（石岐万象汇店）",
    mall: "完美金鹰 · 石岐万象汇",
    category: "coffee",
    aliases: ["tims", "tim hortons", "tims天好咖啡", "天好咖啡"],
    closedAt: "2026-05-25",
    closureLabel: "2026年5月25日营业结束后永久闭店",
    sourceLabel: "南方都市报 · 2026-05-25",
    sourceUrl: "https://m.sohu.com/a/1027432689_161795",
    alternativePlaceIds: ["luckin-coffee", "golden-coffee", "daka-coffee"]
  },
  {
    id: "closed-coucou-shiqi",
    name: "湊湊（石岐万象汇店）",
    mall: "完美金鹰 · 石岐万象汇",
    category: "food",
    aliases: ["湊湊", "凑凑", "湊湊火锅", "凑凑火锅"],
    closedAt: "2026-05-31",
    closureLabel: "2026年5月31日营业结束后闭店",
    sourceLabel: "南方都市报 · 2026-05-25",
    sourceUrl: "https://m.sohu.com/a/1027432689_161795",
    alternativePlaceIds: ["golden-food", "holiday-cafe-de-coral"]
  },
  {
    id: "closed-jingelao-shiqi",
    name: "金阁佬餐厅（石岐万象汇店）",
    mall: "完美金鹰 · 石岐万象汇",
    category: "food",
    aliases: ["金阁佬", "金阁佬餐厅"],
    closedAt: "2026-05-06",
    closureLabel: "2026年5月6日起正式闭店",
    sourceLabel: "南方都市报 · 2026-04-16",
    sourceUrl: "https://news.10jqka.com.cn/20260416/c676053513.shtml",
    alternativePlaceIds: ["golden-food", "holiday-cafe-de-coral"]
  }
];
