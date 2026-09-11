import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://perfectday-ai.vercel.app"),
  title: "PerfectDay AI",
  description: "围绕中山假日广场与完美金鹰·石岐万象汇，规划半日行程、记录途中进度，随时调整剩余安排。",
  applicationName: "PerfectDay AI",
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PerfectDay"
  },
  icons: {
    icon: [{ url: "/images/brand/favicon-32.png", sizes: "32x32", type: "image/png" }],
    shortcut: "/images/brand/favicon-32.png",
    apple: [{ url: "/images/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "PerfectDay AI",
    title: "PerfectDay AI｜你的双商圈随行助手",
    description: "在中山石岐，把假日广场与完美金鹰·石岐万象汇安排成刚刚好的半日行程。",
    images: [{
      url: "/images/brand/og-cover.jpg",
      width: 1200,
      height: 630,
      alt: "PerfectDay AI 中山石岐双商圈手绘视觉"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "PerfectDay AI｜你的双商圈随行助手",
    description: "在中山石岐，把半天过成喜欢的样子。",
    images: ["/images/brand/og-cover.jpg"]
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
