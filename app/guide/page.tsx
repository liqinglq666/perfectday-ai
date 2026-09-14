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
  return <><Header/><main id="main-content" className="page guide-page"><Link className="back-link" href="/"><Icon name="back" size={17}/>回去规划今天</Link>
    <section className="guide-intro"><p className="eyebrow">ONE DISTRICT · MORE POSSIBILITIES</p><h1>商圈已经打通，<br/><em>体验也真正接起来。</em></h1><p>PerfectDay 把已经物理连通、业态互补的完美金鹰广场与假日广场看成一片商圈：假日广场偏阅读、文创与生活美学，完美金鹰侧承接餐饮、购物、亲子、酒店与城市综合消费。</p><span className="planning-status">公开资料查阅：2026年9月7日</span></section>

    <div className="guide-visual-banner">
      <Image src="/images/ui/guide/guide-banner-overview.webp" alt="完美金鹰广场与假日广场一体化商圈拼贴视觉示意" fill priority sizes="(max-width: 760px) calc(100vw - 36px), 1136px"/>
      <span>AI 风格化商圈视觉 · 非精确建筑测绘</span>
    </div>

    <nav className="guide-nav" aria-label="指南目录"><a href="#district">两种气质</a><a href="#facts">商圈概况</a><a href="#arrival">到店提醒</a><a href="#directory">查找地点</a></nav>

    <section className="district-duo" id="district">
      <div className="section-heading"><div><p className="eyebrow">ONE DISTRICT · TWO MOODS</p><h2>一片商圈，两种互补气质</h2></div><span className="section-note">视觉用于理解场景，地点仍以公开来源为准</span></div>
      <div className="district-card-grid">
        <article className="district-visual-card">
          <div className="district-visual-image"><Image src="/images/ui/cards/card-perfect-golden-eagle.webp" alt="完美金鹰广场综合消费场景拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 48vw"/></div>
          <div className="district-card-copy"><span>完美金鹰广场</span><h3>综合消费与都市生活</h3><p>石岐万象汇、金鹰商业街、酒店、写字楼与生活配套共同构成完美金鹰侧的综合体验。路线中会把石岐万象汇作为其中的重要消费节点，而不是另一个独立商圈。</p></div>
        </article>
        <article className="district-visual-card">
          <div className="district-visual-image"><Image src="/images/ui/cards/card-holiday-plaza.webp" alt="假日广场文化与慢生活场景拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 48vw"/></div>
          <div className="district-card-copy"><span>假日广场</span><h3>阅读、文创与慢一点的停留</h3><p>独立书店、文创手作、艺术展览与生活美学是这一侧更鲜明的气质，适合作为约会、朋友聚会或陪家人慢逛时的文化停留。</p></div>
        </article>
      </div>
    </section>

    <div className="guide-facts" id="facts"><article><span>01 / 一体化商圈</span><h2>从“双核并行”到直接贯通</h2><p>中山+报道，多个连通口于2026年8月18日同步开启。规划仍按商场和地点组织，但不再把两边当作两个孤立目的地。</p><a href={sources.connection} target="_blank" rel="noreferrer">中山+ · 2026-08-18 <Icon name="external" size={14}/></a></article><article><span>02 / 文化停留</span><h2>假日广场，适合慢一点</h2><p>南方日报介绍了博雅书店的中山地方文献及港版图书展区。阅读、文创和生活美学是这一侧的重要气质，也适合作为一段行程的慢节奏起点。</p><a href={sources.books} target="_blank" rel="noreferrer">南方日报 · 2026-04-24 <Icon name="external" size={14}/></a></article><article><span>03 / 综合消费</span><h2>把餐饮、购物与亲子接上来</h2><p>完美金鹰侧提供更丰富的综合消费内容。2025年报道提及金鹰广场的母婴室、亲子卫生间等设施；具体楼层与可用情况仍以现场为准。</p><a href={sources.services} target="_blank" rel="noreferrer">南方日报 · 2025-09-12 <Icon name="external" size={14}/></a></article></div>

    <section className="guide-section" id="arrival"><div className="section-heading"><h2>出发前，先知道这些</h2><span className="section-note">公开事实 × 规划估算</span></div><div className="arrival-grid"><article><Icon name="pin"/><h3>把两边看成一片商圈</h3><p>假日广场：兴中道6号。石岐万象汇：孙文东路28号。地点卡可打开高德搜索；到达商场后，再按现场导视寻找铺位。</p></article><article><Icon name="rain"/><h3>连通不等于所有路径都已核实</h3><p>多个连通口已开放，但这不等于已核实全程遮雨、无台阶或所有室内动线。雨天和少走路场景仍优先减少不必要换区。</p></article><article><Icon name="wallet"/><h3>预算留给实际需要</h3><p>餐饮、游玩费用是可调整的人均规划预留，不是门票报价。浏览书店与逛店不预设购物消费；购买后可手动更新剩余预算。</p></article><article><Icon name="clock"/><h3>把未知留给现场确认</h3><p>未接入实时营业、排队、车位、票价或室内导航。停车优惠与会员权益请查看当期规则；不会把历史活动写成正在进行。</p></article></div></section>
    <section className="guide-section" id="directory"><div className="section-heading"><div><p className="eyebrow">找到你的下一站</p><h2>商圈地点，一起看看</h2></div></div><p className="summary-copy">按商场或店名查找。营业与铺位以现场为准，卡片内可查看公开来源。</p><PlaceDirectory entries={places.filter(place => !["start", "connector", "rest", "shopping"].includes(place.category) || ["nitori", "hema", "popmart", "holiday-uniqlo"].includes(place.id)).map(({ id, name, mall, floor, category, sourceLabel, sourceUrl, checkedAt, evidenceNote, searchKeyword }) => ({ id, name, mall, floor, category, sourceLabel, sourceUrl, checkedAt, evidenceNote, searchKeyword }))}/></section>
    <section className="value-note"><p className="eyebrow">把物理连通继续变成体验连通</p><h2>真正被打通的，不只是入口，而是一整段消费旅程。</h2><p>PerfectDay 已经可以演示需求理解、地点筛选、地图查看、途中记录与剩余行程重排。它尝试解决的不是“附近有什么”，而是“这一片商圈里，接下来怎样更顺地继续”。</p><p>若未来取得商圈授权，可接入经维护的铺位、营业与服务设施数据，让书店、餐饮、购物、亲子与生活服务之间的衔接更准确。当前仍是可运行原型，没有接入商场内部系统，也没有真实用户试点结果。</p><Link className="primary-button" href="/">安排我的商圈行程<Icon name="arrow"/></Link></section>
  </main></>;
}
