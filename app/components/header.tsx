"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/ui-icon";
import { SITE_CONFIG } from "@/config/site";

export default function Header() {
  const path = usePathname();
  const inJourney = path === "/trip" || path === "/adjust";
  return <header className="site-header"><div className="header-inner">
    <Link href={SITE_CONFIG.routes.home} className="brand" aria-label={`${SITE_CONFIG.name} 首页`}>
      <span className="brand-mark"><Image src={SITE_CONFIG.assets.icon192} alt="" width={40} height={40} sizes="40px" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}/></span>
      <span className="brand-wordmark">PerfectDay <small>AI</small><span className="brand-subtitle">让每一段，都刚刚好</span></span>
    </Link>
    <nav aria-label="主导航">
      <Link href={SITE_CONFIG.routes.home} aria-current={path === SITE_CONFIG.routes.home ? "page" : undefined}><Icon name="sparkles" size={16}/>规划行程</Link>
      <Link href={SITE_CONFIG.routes.guide} aria-current={path === SITE_CONFIG.routes.guide ? "page" : undefined}><Icon name="book" size={16}/>商圈指南</Link>
    </nav>
    <span className={`location${inJourney ? " location-active" : ""}`}><Icon name={inJourney ? "walk" : "pin"} size={15}/>{inJourney ? (path === "/adjust" ? "正在调整下一段" : "行程进行中") : SITE_CONFIG.locationLabel}</span>
  </div></header>;
}
