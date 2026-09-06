import Link from "next/link";
import Icon from "./ui-icon";
export default function Header() {
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="PerfectDay AI 首页"><span className="brand-mark"><Icon name="sun" size={24}/></span><span>PerfectDay <small>AI</small></span></Link>
    <nav aria-label="主导航"><Link href="/">规划行程</Link><Link href="/#inspiration">路线灵感</Link></nav>
    <span className="location"><Icon name="pin" size={16}/>中山 · 石岐</span>
  </div></header>;
}
