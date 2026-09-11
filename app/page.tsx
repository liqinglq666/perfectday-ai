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

  return <>
    <Header/>
    <main id="main-content" className="page home-page">
      <div className="planning-layout">
        <section className="home-intro" aria-labelledby="home-title">
          <p className="eyebrow"><span/>中山 · 双商圈随行助手</p>
          <h1 id="home-title">今天，<br className="desktop-break"/><em>慢慢逛。</em></h1>
          <p className="intro-copy">喜欢的地方，刚好的节奏。<br/>出发前有安排，逛到一半也能轻松改变。</p>
          <div className="home-benefits">
            <span><Icon name="pin" size={15}/>有来源的地点</span>
            <span><Icon name="sliders" size={15}/>途中随时调整</span>
          </div>
          <div className="home-hero">
            <picture>
              <source media="(max-width: 760px)" srcSet="/images/hero/hero-mobile.webp"/>
              <img
                src="/images/hero/hero-desktop.webp"
                alt="PerfectDay AI 中山石岐双商圈手绘视觉，分别呈现假日广场与石岐万象汇"
                fetchPriority="high"
              />
            </picture>
            <div className="hero-caption">
              <span><Icon name="pin" size={16}/>假日广场 × 完美金鹰·石岐万象汇</span>
              <small>AI 手绘示意</small>
            </div>
          </div>
        </section>
        <PlannerForm initial={input} key={JSON.stringify(input)}/>
      </div>

      <div className="home-guide-link">
        <div>
          <strong>围绕中山真实商圈，安排下一站</strong>
          <p>公开地点资料、到店提示，还有可以直接体验的途中重排。</p>
        </div>
        <Link href="/guide" className="text-link">看看商圈指南<Icon name="arrow" size={17}/></Link>
      </div>

      <RecentTripLink/>
      <InstallTip/>
      <footer className="site-footer">
        <span>PerfectDay AI · 把半天过成喜欢的样子</span>
        <small>图片为 AI 手绘场景示意，非商户或建筑实拍。</small>
      </footer>
    </main>
  </>;
}
