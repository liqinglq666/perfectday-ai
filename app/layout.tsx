import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfectDay AI",
  description: "商圈已经打通，PerfectDay AI 让体验也真正打通：围绕中山完美金鹰·假日商圈规划行程，并在途中变化时只调整未完成部分。",
  applicationName: "PerfectDay AI",
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PerfectDay"
  },
  icons: {
    icon: "/icon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#244b3d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>{children}
      </body>
    </html>
  );
}
