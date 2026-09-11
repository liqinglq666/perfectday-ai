import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/header";
import PlaceDirectory from "@/app/components/place-directory";
import Icon from "@/app/components/ui-icon";
import { places } from "@/data/places";

const sources = {
  connection: "https://zsrbapp.zsnews.cn/home/content/newsContent/0/737871",
  books: "https://epaper.nfnews.com/nfdaily/html/202604/24/content_10168820.html",
  services: "https://epaper.nfnews.com/m/ipaper/nfrb/html/202509/12/content_10147499.html",
};

export default function GuidePage() {
  return <>
    <Header/>
    <main id="main-content" className="page guide-page">
      <Link className="back-link" href="/"><Icon name="back" size={17}/>回去规划今天</Link>

      <section className="guide-intro">
        <p className="eyebrow">GROUNDED IN ZHONGSHAN</p>
        <h1>两种商圈气质，<br/><em>一段合适的行程。</em></h1>
        <p>假日广场的阅读与文化体验，接上完美金鹰·石岐万象汇的餐饮、购物与亲子活动。PerfectDay 帮你选择下一站，也陪你处理途中变化。</p>
        <span className="planning-status">公开资料查阅：2026年9月7日</span>
      </section>

      <figure className="guide-overview-visual">
        <Image
          src="/images/guide/guide-overview.webp"
          alt="PerfectDay AI 石岐双商圈手绘总览，分别呈现假日广场与石岐万象汇"
          width={1200}
          height={900}
          sizes="(max-width: 760px) 100vw, 1136px"
          priority
        />
        <figcaption>AI 手绘场景示意 · 用于帮助理解商圈气质与规划场景，非建筑实拍。</figcaption>
      </figure>

      <nav className="guide-nav" aria-label="指南目录">
        <a href="#district">商圈概况</a>
        <a href="#arrival">到店提醒</a>
        <a href="#directory">查找地点</a>
      </nav>

      <div className="guide-facts" id="district">
        <article>
          <span>01 / 已有连接</span>
          <h2>双商圈已连通</h2>
          <p>中山+报道，多个连通口于2026年8月18日启用。路线按商场分组，跨区时单独留出换区时间。</p>
          <a href={sources.connection} target="_blank" rel="noreferrer">中山+ · 2026-08-18 <Icon name="external" size={14}/></a>
        </article>
        <article>
          <span>02 / 文化停留</span>
          <h2>书店值得慢一点</h2>
          <p>南方日报介绍了博雅书店的中山地方文献及港版图书展区。浏览与购书分开估算，避免把每一次停留都变成消费。</p>
          <a href={sources.books} target="_blank" rel="noreferrer">南方日报 · 2026-04-24 <Icon name="external" size={14}/></a>
        </article>
        <article>
          <span>03 / 家庭出行</span>
          <h2>为途中休息留空间</h2>
          <p>2025年报道提及金鹰广场的母婴室、亲子卫生间等设施。具体楼层与可用情况尚未核实，可向商场服务台询问。</p>
          <a href={sources.services} target="_blank" rel="noreferrer">南方日报 · 2025-09-12 <Icon name="external" size={14}/></a>
        </article>
      </div>

      <section className="mall-visual-grid" aria-label="双商圈视觉导览">
        <article>
          <Image
            src="/images/malls/holiday-plaza.webp"
            alt="假日广场手绘场景示意"
            width={1200}
            height={900}
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <div>
            <p className="eyebrow">HOLIDAY PLAZA</p>
            <h2>假日广场 · 适合慢下来</h2>
            <p>把书店、咖啡、文化与轻松停留放在同一段节奏里，适合作为路线里更松弛的文化生活停留。</p>
          </div>
        </article>
        <article>
          <Image
            src="/images/malls/mixc-shiqi.webp"
            alt="完美金鹰·石岐万象汇手绘场景示意"
            width={1200}
            height={900}
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <div>
            <p className="eyebrow">PERFECT GOLDEN EAGLE · SHIQI MIXC</p>
            <h2>石岐万象汇 · 选择更丰富</h2>
            <p>餐饮、购物、亲子与生活方式业态更适合承接后半程，让路线在吃、逛、玩之间更容易继续。</p>
          </div>
        </article>
      </section>

      <section className="guide-section" id="arrival">
        <div className="section-heading"><h2>出发前，先知道这些</h2><span className="section-note">公开事实 × 规划估算</span></div>
        <div className="arrival-grid">
          <article><Icon name="pin"/><h3>找对目的地</h3><p>假日广场：兴中道6号。石岐万象汇：孙文东路28号。地点卡可打开高德搜索；导航到商场后，再按现场导视寻找铺位。</p></article>
          <article><Icon name="rain"/><h3>雨天与少走路</h3><p>连通口开放不等于已核实全程遮雨或无台阶。雨天优先单一商场；途中选“少走路”会优先留在你标记的商场。</p></article>
          <article><Icon name="wallet"/><h3>预算留给实际需要</h3><p>餐饮、游玩费用是可调整的人均规划预留，不是门票报价。浏览书店与逛店不预设购物消费；购买后可手动更新剩余预算。</p></article>
          <article><Icon name="clock"/><h3>把未知留给现场确认</h3><p>未接入实时营业、排队、车位、票价或室内导航。停车优惠与会员权益请查看当期规则；不会把历史活动写成正在进行。</p></article>
        </div>
      </section>

      <section className="guide-section" id="directory">
        <div className="section-heading"><div><p className="eyebrow">找到你的下一站</p><h2>商圈地点，一起看看</h2></div></div>
        <p className="summary-copy">按商场或店名查找。营业与铺位以现场为准，卡片内可查看公开来源。</p>
        <PlaceDirectory entries={places.filter(place => !["start", "connector", "rest", "shopping"].includes(place.category) || ["nitori", "hema", "popmart", "holiday-uniqlo"].includes(place.id)).map(({ id, name, mall, floor, category, sourceLabel, sourceUrl, checkedAt, evidenceNote, searchKeyword }) => ({ id, name, mall, floor, category, sourceLabel, sourceUrl, checkedAt, evidenceNote, searchKeyword }))}/>
      </section>

      <section className="value-note">
        <p className="eyebrow">一个可以接入真实场景的起点</p>
        <h2>让跨商圈选择，延续到逛街途中。</h2>
        <p>已经可以演示需求理解、地点筛选、地图查看、途中记录与剩余行程重排。预期价值是降低临时决策负担，让书店、餐饮与亲子等互补业态更容易被发现；这些效果尚未经过真实用户试用验证。</p>
        <p>若未来取得商圈授权，可接入经维护的铺位、营业与服务设施数据。门店参与、效果指标及运营合作均属于后续计划，当前没有接入商场内部系统。</p>
        <Link className="primary-button" href="/">安排我的半日行程<Icon name="arrow"/></Link>
      </section>
    </main>
  </>;
}
