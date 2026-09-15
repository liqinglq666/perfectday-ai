import { SITE_CONFIG } from "@/config/site";

export function amapUrl(keyword: string) {
  const params = new URLSearchParams({
    keyword,
    city: SITE_CONFIG.map.city,
    view: "map",
    src: SITE_CONFIG.map.source,
    callnative: "1"
  });
  return `https://uri.amap.com/search?${params}`;
}
