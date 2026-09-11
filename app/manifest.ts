import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PerfectDay AI",
    short_name: "PerfectDay",
    description: "一键生成你的双商圈完美半日",
    start_url: "/",
    scope: "/",
    lang: "zh-CN",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f8f4",
    theme_color: "#244b3d",
    categories: ["lifestyle", "travel"],
    icons: [
      { src: "/images/brand/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/brand/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/brand/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
