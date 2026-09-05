import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfectDay AI",
  description: "一键生成你的商圈完美半日",
  applicationName: "PerfectDay AI"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c89538"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
