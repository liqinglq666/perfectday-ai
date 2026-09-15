"use client";

import Link from "next/link";
import Icon from "@/app/components/ui-icon";
import { RecentTrip } from "@/app/components/trip/trip-memory";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="page error-page">
    <span className="finish-symbol"><Icon name="sun" size={34}/></span>
    <p className="eyebrow">稍等一下，再继续出发</p>
    <h1>这次没能顺利打开</h1>
    <p>可以重试当前页面，或打开此设备保存的最近行程。</p>
    <div className="error-actions">
      <button className="primary-button" onClick={reset}>重新尝试<Icon name="arrow"/></button>
      <Link className="secondary-button" href="/">返回首页</Link>
    </div>
    <RecentTrip/>
  </main>;
}
