"use client";

import Image from "next/image";
import Link from "next/link";
import Icon from "@/app/components/ui-icon";
import { RecentTrip } from "@/app/components/trip-memory";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="page error-page">
    <div className="error-visual-layout">
      <div className="error-copy">
        <span className="finish-symbol"><Icon name="sun" size={34}/></span>
        <p className="eyebrow">稍等一下，再继续出发</p>
        <h1>这次没能顺利打开</h1>
        <p>可以重试当前页面，或打开此设备保存的最近行程。</p>
        <div className="error-actions">
          <button className="primary-button" onClick={reset}>重新尝试<Icon name="arrow"/></button>
          <Link className="secondary-button" href="/">返回首页</Link>
        </div>
      </div>
      <Image
        className="error-illustration"
        src="/images/states/error.webp"
        alt="PerfectDay AI 出错重试手绘场景"
        width={1200}
        height={900}
        sizes="(max-width: 760px) 100vw, 420px"
        priority
      />
    </div>
    <RecentTrip/>
  </main>;
}
