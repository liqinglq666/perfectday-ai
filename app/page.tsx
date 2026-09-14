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
        <div className="home-copy">
          <p className="eyebrow"><span/>完美金鹰·假日商圈 · 一体化随行助手</p>
          <h1 id="home-title">商圈已打通，<br/><em>体验也打通。</em></h1>
          <p className="intro-copy">告诉我同行人、时间、预算和偏好，先给你一条刚好的路线。途中下雨、走累或餐厅排队，只调整还没发生的部分。</p>
          <div className="home-benefits">
            <span><Icon name="pin" size={15}/>互补业态一起规划</span>
            <span><Icon name="sliders" size={15}/>变化只改未来</span>
          </div>
        </div>
        <div className="home-hero">
          <Image className="hero-desktop-image" src="/images/ui/hero/hero-home-desktop.webp" alt="完美金鹰与假日商圈拼贴风格体验示意" fill priority sizes="(max-width: 760px) 0px, 44vw"/>
          <Image className="hero-mobile-image" src="/images/ui/hero/hero-home-mobile.webp" alt="完美金鹰与假日商圈手机端拼贴风格体验示意" fill priority sizes="(max-width: 760px) calc(100vw - 36px), 0px"/>
          <div className="hero-float-tag"><Icon name="pin" size={14}/><span>一片商圈 · 两种气质</span></div>
        </div>
      </section>
      <PlannerForm initial={input} key={JSON.stringify(input)}/>
    </div>

    <section className="experience-flow" aria-labelledby="experience-title">
      <div className="flow-heading">
        <p className="eyebrow">JOURNEY MAINTENANCE</p>
        <h2 id="experience-title">从一句话，到一路都能继续。</h2>
        <p>PerfectDay 不只给你一张清单，而是维护一段正在发生的商圈行程。</p>
      </div>
      <div className="flow-steps" aria-label="PerfectDay 使用流程">
        <article><span>01</span><strong>说出需求</strong><p>同行人、时间、预算、偏好与排除项。</p></article>
        <article><span>02</span><strong>生成路线</strong><p>把文化、餐饮、购物与亲子内容接成一条线。</p></article>
        <article><span>03</span><strong>途中变化</strong><p>排队、下雨、走累或时间缩短都可以改。</p></article>
        <article><span>04</span><strong>只重排未来</strong><p>已经完成的保留，只调整剩余行程。</p></article>
      </div>
      <div className="feature-visual-grid">
        <article className="feature-visual-card">
          <div className="feature-thumb"><Image src="/images/ui/features/feature-plan.webp" alt="AI 根据用户需求生成商圈路线的拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 46vw"/></div>
          <div className="feature-card-copy"><span>先规划</span><h3>把“想怎么玩”变成一条可执行路线</h3><p>AI 负责理解自然语言，地点真实性与时间预算由确定性规则守住。</p></div>
        </article>
        <article className="feature-visual-card">
          <div className="feature-thumb"><Image src="/images/ui/features/feature-replan.webp" alt="途中变化后只重排未完成行程的拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 46vw"/></div>
          <div className="feature-card-copy"><span>再接住变化</span><h3>计划变了，不用从头再来</h3><p>已完成地点保持不动，只对还没发生的部分重新排序或替换。</p></div>
        </article>
      </div>
    </section>

    <div className="home-guide-link"><div><strong>一片商圈，两种互补气质</strong><p>假日广场偏阅读、文创与生活美学；完美金鹰侧承接餐饮、购物、亲子与综合消费。</p></div><Link href="/guide" className="text-link">看看商圈指南<Icon name="arrow" size={17}/></Link></div>
    <RecentTripLink/><InstallTip/>
    <footer className="site-footer"><span>PerfectDay AI · 把物理连通变成体验连通</span><small>图片为 AI 风格化体验示意，不代表精确建筑或室内动线。</small></footer>
  </main></>;
}
