import Header from "@/app/components/header";
export default function Loading() {
  return <><Header/><main id="main-content" className="page loading-page" aria-busy="true"><p className="loading-label" role="status"><span className="spinner"/>正在打开你的安排…</p><div className="skeleton skeleton-title"/><div className="loading-grid"><div><div className="skeleton skeleton-feature"/><div className="skeleton skeleton-card"/><div className="skeleton skeleton-card"/></div><div className="skeleton skeleton-sidebar"/></div></main></>;
}
