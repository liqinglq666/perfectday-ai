import type { Metadata, Viewport } from "next";
import { SITE_CONFIG } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://perfectday-ai.vercel.app"),
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.shortName
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE_CONFIG.name,
    title: "PerfectDay AI｜完美金鹰·假日商圈一体化随行助手",
    description: "商圈已经打通，体验也该打通。按时间、预算和偏好规划路线，途中变化只重排未完成部分。",
    images: [{
      url: SITE_CONFIG.assets.openGraph,
      width: 1672,
      height: 941,
      alt: "PerfectDay AI 完美金鹰·假日商圈一体化随行助手"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: "商圈已经打通，体验也该打通。",
    images: [SITE_CONFIG.assets.openGraph]
  },
  icons: {
    icon: [
      { url: SITE_CONFIG.assets.favicon },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: SITE_CONFIG.assets.favicon,
    apple: SITE_CONFIG.assets.appleTouchIcon
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
    <html lang={SITE_CONFIG.locale}>
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>{children}
      </body>
    </html>
  );
}
