"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/ui-icon";
import { SITE_CONFIG } from "@/config/site";

export default function Header() {
  const path = usePathname();

  return <header className="site-header"><div className="header-inner">
    <Link href={SITE_CONFIG.routes.home} className="brand" aria-label={`${SITE_CONFIG.name} 首页`}>
      <span className="brand-mark"><Image src={SITE_CONFIG.assets.icon192} alt="" width={80} height={80} priority sizes="40px" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}/></span>
      <span>PerfectDay <small>AI</small></span>
    </Link>
    <nav aria-label="主导航">
      <Link href={SITE_CONFIG.routes.home} aria-current={path === SITE_CONFIG.routes.home ? "page" : undefined}>规划行程</Link>
      <Link href={SITE_CONFIG.routes.guide} aria-current={path === SITE_CONFIG.routes.guide ? "page" : undefined}>商圈指南</Link>
    </nav>
    <span className="location"><Icon name="pin" size={15}/>{SITE_CONFIG.locationLabel}</span>
  </div></header>;
}
