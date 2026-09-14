import Image from "next/image";
import Header from "@/app/components/header";

export default function Loading() {
  return <><Header/><main id="main-content" className="page loading-page" aria-busy="true">
    <section className="loading-intro-card">
      <div>
        <p className="loading-label" role="status"><span className="spinner"/>正在为你整理这一段商圈行程…</p>
        <h1>把你的需求，接成一条刚好的路线。</h1>
        <p>正在匹配地点、时间、预算和步行偏好。稍等一下，途中变化也可以继续调整。</p>
      </div>
      <div className="loading-art"><Image src="/images/ui/states/state-loading.webp" alt="商圈路线正在生成的拼贴插图" fill sizes="220px"/></div>
    </section>
    <div className="skeleton skeleton-title"/>
    <div className="loading-grid"><div><div className="skeleton skeleton-feature"/><div className="skeleton skeleton-card"/><div className="skeleton skeleton-card"/></div><div className="skeleton skeleton-sidebar"/></div>
  </main></>;
}
