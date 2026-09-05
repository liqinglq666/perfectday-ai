import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PerfectDay AI",
    short_name: "PerfectDay",
    description: "一键生成你的商圈完美半日",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ef",
    theme_color: "#c89538",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
