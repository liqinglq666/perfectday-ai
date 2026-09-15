import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { RecentTrip } from "@/app/components/trip/trip-memory";

export default function NotFound() {
  return <><Header/><main id="main-content" className="page error-page">
    <span className="finish-symbol"><Icon name="pin" size={34}/></span>
    <p className="eyebrow">好像走到了另一条路</p>
    <h1>这个页面暂时找不到</h1>
    <p>可以回到首页，或者接着上次的行程继续逛。</p>
    <div className="error-actions">
      <Link href="/" className="primary-button">回到首页<Icon name="arrow"/></Link>
      <Link href="/guide" className="secondary-button">看看商圈指南</Link>
    </div>
    <RecentTrip/>
  </main></>;
}
