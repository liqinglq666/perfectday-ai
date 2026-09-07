"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./ui-icon";
export default function Header() {
  const path = usePathname();
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="PerfectDay AI 首页"><span className="brand-mark"><Icon name="sun" size={24}/></span><span>PerfectDay <small>AI</small></span></Link>
    <nav aria-label="主导航"><Link href="/" aria-current={path === "/" ? "page" : undefined}>规划行程</Link><Link href="/guide" aria-current={path === "/guide" ? "page" : undefined}>商圈指南</Link></nav>
    <span className="location"><Icon name="pin" size={15}/>中山 · 石岐</span>
  </div></header>;
}
