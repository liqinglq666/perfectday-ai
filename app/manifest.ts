import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PerfectDay AI",
    short_name: "PerfectDay",
    description: "一键生成你的商圈完美半日",
    start_url: "/",
    scope: "/",
    lang: "zh-CN",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f8f4",
    theme_color: "#244b3d",
    categories: ["lifestyle", "travel"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/maskable-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ],
    shortcuts: [
      {
        name: "朋友聚会",
        short_name: "朋友聚会",
        description: "快速生成朋友聚会半日路线",
        url: "/trip?scene=friends&duration=240&budget=500&walking=low"
      },
      {
        name: "亲子轻松逛",
        short_name: "亲子",
        description: "快速生成亲子少走路路线",
        url: "/trip?scene=family&duration=240&budget=500&walking=low"
      }
    ]
  };
}

