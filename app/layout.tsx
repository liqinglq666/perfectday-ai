import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://perfectday-ai.vercel.app"),
  title: "PerfectDay AI",
  description: "商圈已经打通，PerfectDay AI 让体验也真正打通：围绕中山完美金鹰·假日商圈规划行程，并在途中变化时只调整未完成部分。",
  applicationName: "PerfectDay AI",
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PerfectDay"
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "PerfectDay AI",
    title: "PerfectDay AI｜完美金鹰·假日商圈一体化随行助手",
    description: "商圈已经打通，体验也该打通。按时间、预算和偏好规划路线，途中变化只重排未完成部分。",
    images: [{
      url: "/images/share/perfectday-dual-district-og.png",
      width: 1672,
      height: 941,
      alt: "PerfectDay AI 完美金鹰·假日商圈一体化随行助手"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "PerfectDay AI",
    description: "商圈已经打通，体验也该打通。",
    images: ["/images/share/perfectday-dual-district-og.png"]
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png"
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
