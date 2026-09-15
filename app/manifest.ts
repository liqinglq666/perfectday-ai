import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: SITE_CONFIG.routes.home,
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.shortName,
    description: "完美金鹰·假日商圈一体化随行助手：按同行人、时间、预算与偏好规划路线，途中变化时只调整未完成部分。",
    start_url: SITE_CONFIG.routes.home,
    scope: SITE_CONFIG.routes.home,
    lang: SITE_CONFIG.locale,
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f4ee",
    theme_color: "#244b3d",
    categories: ["lifestyle", "travel"],
    icons: [
      { src: SITE_CONFIG.assets.icon192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: SITE_CONFIG.assets.icon512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: SITE_CONFIG.assets.icon512, sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
