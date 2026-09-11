import Image from "next/image";
import Header from "@/app/components/header";

export default function Loading() {
  return <>
    <Header/>
    <main id="main-content" className="page loading-page" aria-busy="true">
      <p className="loading-label" role="status"><span className="spinner"/>正在打开你的安排…</p>
      <div className="skeleton skeleton-title"/>
      <div className="loading-grid">
        <div>
          <div className="skeleton skeleton-feature"/>
          <div className="skeleton skeleton-card"/>
          <div className="skeleton skeleton-card"/>
        </div>
        <figure className="loading-illustration" aria-hidden="true">
          <Image
            src="/images/states/loading.webp"
            alt=""
            width={1200}
            height={900}
            sizes="(max-width: 760px) 100vw, 320px"
          />
        </figure>
      </div>
    </main>
  </>;
}
