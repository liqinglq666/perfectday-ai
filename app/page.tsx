import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import InstallTip from "@/app/components/home/install-tip";
import PlannerForm from "@/app/components/home/planner-form";
import HomeHero from "@/app/components/home/home-hero";
import { RecentTrip } from "@/app/components/trip/trip-memory";
import { parseInput } from "@/lib/planner";

export const maxDuration = 30;

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const input = parseInput(await searchParams, false);

  return <><Header/><main id="main-content" className="page home-page v4-home">
    <RecentTrip/>
    <div className="planning-layout v4-hero-layout">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="brand-kicker">YOUR DAY, AT YOUR PACE</p>
          <p className="eyebrow home-eyebrow"><span/>完美金鹰·假日商圈 · 一体化随行助手</p>
          <h1 id="home-title">把今天，<br/><em>安排得刚刚好。</em></h1>
          <p className="intro-copy">说说和谁一起、想逛多久。把书店、咖啡和下一站接成一条适合你的路线。下雨、走累或排队了，随时再调整。</p>
          <div className="home-benefits" aria-label="PerfectDay 核心能力">
            <span><Icon name="pin" size={15}/>一体化商圈</span>
            <span><Icon name="sparkles" size={15}/>真实地点</span>
            <span><Icon name="sliders" size={15}/>只重排未来</span>
          </div>
          <div className="hero-actions"><a className="primary-button" href="#planner">规划今天<Icon name="arrow" size={17}/></a><Link className="text-link" href="/guide">先看看商圈<Icon name="external" size={15}/></Link></div>
        </div>
        <HomeHero/>
      </section>
      <PlannerForm initial={input} key={JSON.stringify(input)}/>
    </div>

    <section className="experience-flow v4-flow" aria-labelledby="experience-title">
      <div className="flow-heading">
        <div>
          <p className="brand-kicker">JOURNEY MAINTENANCE</p>
          <h2 id="experience-title">从出发到下一站，都有人帮你想。</h2>
          <p>先规划，再出发。已经走过的保留，接下来的随时调整。</p>
        </div>
        <p className="flow-note">PLAN LESS.<br/>ENJOY MORE.</p>
      </div>
      <div className="flow-steps" aria-label="PerfectDay 使用流程">
        <article><span className="flow-step-icon"><Icon name="sparkles" size={18}/></span><small>01</small><strong>说出需求</strong><p>同行人、时间、预算、偏好与排除项。</p></article>
        <article><span className="flow-step-icon"><Icon name="pin" size={18}/></span><small>02</small><strong>生成路线</strong><p>把文化、餐饮、购物与亲子内容接成一条线。</p></article>
        <article><span className="flow-step-icon"><Icon name="rain" size={18}/></span><small>03</small><strong>途中变化</strong><p>排队、下雨、走累或时间缩短都可以改。</p></article>
        <article><span className="flow-step-icon"><Icon name="sliders" size={18}/></span><small>04</small><strong>只重排未来</strong><p>已经完成的保留，只调整剩余行程。</p></article>
      </div>
      <div className="feature-visual-grid">
        <article className="feature-visual-card feature-plan-card">
          <div className="feature-thumb"><Image src="/images/ui/features/feature-plan.webp" alt="AI 根据用户需求生成商圈路线的拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 46vw"/></div>
          <div className="feature-card-copy"><span>AI PLANNING</span><h3>把“想怎么玩”变成一条可执行路线</h3><p>说出需求，也可以直接选择偏好。路线只使用地点库中的地点，并考虑你的时间与预算。</p><a href="#planner" className="feature-link">开始规划 <Icon name="arrow" size={14}/></a></div>
        </article>
        <article className="feature-visual-card feature-replan-card">
          <div className="feature-thumb"><Image src="/images/ui/features/feature-replan.webp" alt="途中变化后只重排未完成行程的拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 46vw"/></div>
          <div className="feature-card-copy"><span>LIVE REPLANNING</span><h3>计划变了，不用从头再来</h3><p>已完成地点保持不动，只对还没发生的部分重新排序或替换。</p><a href="#planner" className="feature-link">试试变化重排 <Icon name="arrow" size={14}/></a></div>
        </article>
      </div>
    </section>

    <div className="home-guide-link v4-summary-strip"><div className="summary-mark"><span>02</span><Icon name="pin" size={18}/></div><div className="summary-main"><strong>一片商圈，两种互补气质</strong><p>假日广场偏阅读、文创与生活美学；完美金鹰侧承接餐饮、购物、亲子与综合消费。</p></div><Link href="/guide" className="text-link">看看商圈指南<Icon name="arrow" size={17}/></Link></div>
    <InstallTip/>
    <footer className="site-footer"><span>PerfectDay AI · 把物理连通变成体验连通</span><small>图片为 AI 风格化体验示意，不代表精确建筑或室内动线。</small></footer>
  </main></>;
}
