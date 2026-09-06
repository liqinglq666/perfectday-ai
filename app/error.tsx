"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="page error-page"><p className="eyebrow">PERFECTDAY AI</p><h1>这次没能顺利打开</h1><p>请重试一次，或回到首页重新安排。</p><div className="error-actions"><button className="primary-button" onClick={reset}>重试</button><Link className="secondary-button" href="/">返回首页</Link></div></main>;
}
