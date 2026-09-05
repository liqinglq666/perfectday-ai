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
    background_color: "#f8f5ef",
    theme_color: "#c89538",
    categories: ["lifestyle", "travel"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ],
    shortcuts: [
      {
        name: "朋友聚会",
        short_name: "朋友聚会",
        url: "/trip?scene=friends&duration=240&budget=500&walking=low"
      },
      {
        name: "亲子轻松逛",
        short_name: "亲子",
        url: "/trip?scene=family&duration=240&budget=500&walking=low"
      }
    ]
  };
}
