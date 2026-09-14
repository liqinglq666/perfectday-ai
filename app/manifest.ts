import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PerfectDay AI",
    short_name: "PerfectDay",
    description: "完美金鹰·假日商圈一体化随行助手：按同行人、时间、预算与偏好规划路线，途中变化时只调整未完成部分。",
    start_url: "/",
    scope: "/",
    lang: "zh-CN",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f4ee",
    theme_color: "#244b3d",
    categories: ["lifestyle", "travel"],
    icons: [
      { src: "/icons/perfectday-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/perfectday-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/perfectday-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
