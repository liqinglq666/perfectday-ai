export const SITE_CONFIG = {
  name: "PerfectDay AI",
  shortName: "PerfectDay",
  title: "PerfectDay AI",
  description: "商圈已经打通，PerfectDay AI 让体验也真正打通：围绕中山完美金鹰·假日商圈规划行程，并在途中变化时只调整未完成部分。",
  locale: "zh-CN",
  locationLabel: "中山 · 石岐",
  routes: {
    home: "/",
    trip: "/trip",
    adjust: "/adjust",
    guide: "/guide"
  },
  map: {
    city: "中山市",
    source: "perfectday-ai"
  },
  assets: {
    openGraph: "/images/share/perfectday-dual-district-og.png",
    icon192: "/icons/perfectday-icon-192.png",
    icon512: "/icons/perfectday-icon-512.png",
    appleTouchIcon: "/icons/apple-touch-icon.png",
    favicon: "/icons/favicon.ico"
  }
} as const;
