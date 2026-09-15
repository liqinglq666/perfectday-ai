import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/header";
import PlaceDirectory from "@/app/components/guide/place-directory";
import Icon from "@/app/components/ui-icon";
import { places } from "@/data/places";

const sources = {
  connection: "https://zsrbapp.zsnews.cn/home/content/newsContent/0/737871",
  books: "https://epaper.nfnews.com/nfdaily/html/202604/24/content_10168820.html",
  services: "https://epaper.nfnews.com/m/ipaper/nfrb/html/202509/12/content_10147499.html",
};

export default function GuidePage() {
  return <><Header/><main id="main-content" className="page guide-page v4-guide">
    <Link className="back-link" href="/"><Icon name="back" size={17}/>回去规划今天</Link>

    <section className="guide-editorial-hero">
      <div className="guide-intro">
        <p className="brand-kicker">A GUIDE TO PERFECTDAY DISTRICT</p>
        <h1>完美金鹰 · 假日商圈<br/><em>生活指南</em></h1>
        <p>从文化慢逛到综合消费，把已经物理连通、业态互补的两片空间，看成一段可以顺着走下去的城市生活体验。</p>
        <div className="guide-pills" aria-label="指南特点"><span><Icon name="pin" size={14}/>真实地点</span><span><Icon name="sparkles" size={14}/>互补业态</span><span><Icon name="clock" size={14}/>按节奏停留</span></div>
        <span className="planning-status">公开资料查阅：2026年9月7日</span>
      </div>
      <div className="guide-visual-banner">
        <Image src="/images/ui/guide/guide-banner-overview.webp" alt="完美金鹰广场与假日广场一体化商圈拼贴视觉示意" fill priority sizes="(max-width: 760px) calc(100vw - 36px), 54vw"/>
        <span>AI 风格化商圈视觉 · 非精确建筑测绘</span>
      </div>
    </section>

    <nav className="guide-nav" aria-label="指南目录"><a href="#district">两种气质</a><a href="#facts">商圈概况</a><a href="#arrival">到店提醒</a><a href="#directory">精选去处</a></nav>

    <section className="district-duo" id="district">
      <div className="section-heading editorial-heading"><div><p className="brand-kicker">ONE DISTRICT · TWO MOODS</p><h2>一片商圈，两种互补气质</h2></div><span className="section-note">一个偏文化停留，一个承接综合消费</span></div>
      <div className="district-card-grid">
        <article className="district-visual-card district-card-holiday">
          <div className="district-card-copy"><span>HOLIDAY PLAZA</span><h3>假日广场</h3><strong>文艺与生活交汇的城市客厅</strong><p>独立书店、文创手作、艺术展览与生活美学，是这一侧更鲜明的气质。适合把节奏放慢，作为约会、朋友聚会或陪家人慢逛时的文化停留。</p><div className="district-tags"><span>书店</span><span>文创</span><span>展览</span><span>咖啡</span><span>生活美学</span></div></div>
          <div className="district-visual-image"><Image src="/images/ui/cards/card-holiday-plaza.webp" alt="假日广场文化与慢生活场景拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 43vw"/></div>
        </article>
        <article className="district-visual-card district-card-eagle">
          <div className="district-visual-image"><Image src="/images/ui/cards/card-perfect-golden-eagle.webp" alt="完美金鹰广场综合消费场景拼贴示意" fill sizes="(max-width: 760px) calc(100vw - 36px), 43vw"/></div>
          <div className="district-card-copy"><span>PERFECT GOLDEN EAGLE</span><h3>完美金鹰广场</h3><strong>多元体验的城市生活引擎</strong><p>石岐万象汇、金鹰商业街、酒店、写字楼与生活配套共同构成这一侧的综合体验。石岐万象汇是其中的重要消费节点，而不是另一个独立商圈。</p><div className="district-tags"><span>餐饮</span><span>购物</span><span>亲子</span><span>金鹰商业街</span></div></div>
        </article>
      </div>
    </section>

    <div className="guide-facts" id="facts"><article><span>01 / 一体化商圈</span><h2>从“双核并行”到直接贯通</h2><p>中山+报道，多个连通口于2026年8月18日同步开启。规划仍按商场和地点组织，但不再把两边当作两个孤立目的地。</p><a href={sources.connection} target="_blank" rel="noreferrer">中山+ · 2026-08-18 <Icon name="external" size={14}/></a></article><article><span>02 / 文化停留</span><h2>假日广场，适合慢一点</h2><p>南方日报介绍了博雅书店的中山地方文献及港版图书展区。阅读、文创和生活美学是这一侧的重要气质，也适合作为一段行程的慢节奏起点。</p><a href={sources.books} target="_blank" rel="noreferrer">南方日报 · 2026-04-24 <Icon name="external" size={14}/></a></article><article><span>03 / 综合消费</span><h2>把餐饮、购物与亲子接上来</h2><p>完美金鹰侧提供更丰富的综合消费内容。2025年报道提及金鹰广场的母婴室、亲子卫生间等设施；具体楼层与可用情况仍以现场为准。</p><a href={sources.services} target="_blank" rel="noreferrer">南方日报 · 2025-09-12 <Icon name="external" size={14}/></a></article></div>

    <section className="guide-section" id="arrival"><div className="section-heading"><div><p className="brand-kicker">BEFORE YOU GO</p><h2>出发前，先知道这些</h2></div><span className="section-note">公开事实 × 规划估算</span></div><div className="arrival-grid"><article><Icon name="pin"/><h3>把两边看成一片商圈</h3><p>假日广场：兴中道6号。石岐万象汇：孙文东路28号。地点卡可打开高德搜索；到达商场后，再按现场导视寻找铺位。</p></article><article><Icon name="rain"/><h3>连通不等于所有路径都已核实</h3><p>多个连通口已开放，但这不等于已核实全程遮雨、无台阶或所有室内动线。雨天和少走路场景仍优先减少不必要换区。</p></article><article><Icon name="wallet"/><h3>预算留给实际需要</h3><p>餐饮、游玩费用是可调整的人均规划预留，不是门票报价。浏览书店与逛店不预设购物消费；购买后可手动更新剩余预算。</p></article><article><Icon name="clock"/><h3>把未知留给现场确认</h3><p>未接入实时营业、排队、车位、票价或室内导航。停车优惠与会员权益请查看当期规则；不会把历史活动写成正在进行。</p></article></div></section>

    <section className="guide-section" id="directory"><div className="section-heading editorial-heading"><div><p className="brand-kicker">CURATED PLACES</p><h2>精选去处<span className="sr-only">商圈地点，一起看看</span></h2></div><span className="section-note">从书店咖啡到餐饮、购物与亲子</span></div><p className="summary-copy">按商场或店名查找。地点卡保留公开来源，营业与铺位仍以现场为准。</p><PlaceDirectory entries={places.filter(place => !["start", "connector", "rest", "shopping"].includes(place.category) || ["nitori", "hema", "popmart", "holiday-uniqlo"].includes(place.id)).map(({ id, name, mall, floor, category, sourceLabel, sourceUrl, checkedAt, evidenceNote, searchKeyword }) => ({ id, name, mall, floor, category, sourceLabel, sourceUrl, checkedAt, evidenceNote, searchKeyword }))}/></section>

    <section className="value-note v4-value-note"><div><p className="brand-kicker">PHYSICAL CONNECTION → EXPERIENCE CONNECTION</p><h2>真正被打通的，不只是入口，而是一整段消费旅程。</h2><p>PerfectDay 已经可以演示需求理解、地点筛选、地图查看、途中记录与剩余行程重排。它解决的不是“附近有什么”，而是“这一片商圈里，接下来怎样更顺地继续”。</p></div><Link className="primary-button" href="/">开始规划今天的路线<Icon name="arrow"/></Link></section>
  </main></>;
}
