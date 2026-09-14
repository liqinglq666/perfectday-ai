import Image from "next/image";
import Link from "next/link";
import PlannerForm from "@/app/components/planner-form";
import { RecentTripLink } from "@/app/components/trip-memory";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import InstallTip from "@/app/components/install-tip";
import { parseInput } from "@/lib/planner";
export const maxDuration = 30;
export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const input = parseInput(await searchParams, false);
  return <><Header/><main id="main-content" className="page home-page">
    <div className="planning-layout">
      <section className="home-intro" aria-labelledby="home-title">
        <p className="eyebrow"><span/>完美金鹰·假日商圈 · 一体化随行助手</p>
        <h1 id="home-title">商圈已经打通，<br className="desktop-break"/><em>体验也真正打通。</em></h1>
        <p className="intro-copy">告诉我同行人、时间、预算和偏好，把互补业态接成一条刚好的路线。<br/>下雨、走累、排队或时间变化时，只调整还没发生的部分。</p><div className="home-benefits"><span><Icon name="pin" size={15}/>互补业态一起规划</span><span><Icon name="sliders" size={15}/>只重排未完成行程</span></div>
        <div className="home-hero"><Image src="/images/city-afternoon.webp" alt="绿树与暖阳下的商圈步行街氛围示意" fill priority sizes="(max-width: 760px) 126px, 48vw"/><div className="hero-caption"><span><Icon name="pin" size={16}/>完美金鹰·假日商圈</span><small>一体化商圈体验示意</small></div></div>
      </section>
      <PlannerForm initial={input} key={JSON.stringify(input)}/>
    </div>
    <div className="home-guide-link"><div><strong>两个商圈，不再是两份攻略</strong><p>把书店、咖啡、餐饮、购物与亲子等互补内容接成一条能继续、能调整的商圈行程。</p></div><Link href="/guide" className="text-link">看看商圈指南<Icon name="arrow" size={17}/></Link></div>
    <RecentTripLink/><InstallTip/><footer className="site-footer"><span>PerfectDay AI · 把物理连通变成体验连通</span><small>图片为 AI 生成的氛围示意，非商户实拍。</small></footer>
  </main></>;
}
