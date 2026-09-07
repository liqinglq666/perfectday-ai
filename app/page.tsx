import Image from "next/image";
import Link from "next/link";
import PlannerForm from "@/app/components/planner-form";
import { RecentTrip } from "@/app/components/trip-memory";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import InstallTip from "@/app/components/install-tip";
import { parseInput, queryString } from "@/lib/planner";
export const maxDuration = 30;
const inspirations = [
  { scene: "solo", tag: "留点时间给自己", title: "书店与咖啡的慢时光", meta: "翻几页书，再喝一杯喜欢的咖啡", image: "coffee-reading", request: "想逛书店、喝咖啡，轻松一点", budget: "300" },
  { scene: "friends", tag: "朋友的快乐集合", title: "一起玩，才够尽兴", meta: "互动运动与咖啡，安排一场轻松小聚", image: "play-together", request: "和朋友玩游戏或运动，再喝咖啡", budget: "300" },
  { scene: "family", tag: "一家人的小出游", title: "把快乐安排在室内", meta: "亲子乐园、慢逛，还有休息的时间", image: "city-afternoon", request: "带孩子逛4小时，尽量室内，少走路", budget: "500" }
];
export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const input = parseInput(await searchParams, false);
  return <><Header/><main id="main-content" className="page home-page">
    <RecentTrip/>
    <div className="planning-layout">
      <section className="home-intro" aria-labelledby="home-title">
        <p className="eyebrow"><span/>中山 · 双商圈随行助手</p>
        <h1 id="home-title">今天，<br className="desktop-break"/><em>慢慢逛。</em></h1>
        <p className="intro-copy">喜欢的地方，刚好的节奏。<br/>出发前有安排，逛到一半也能轻松改变。</p><div className="home-benefits"><span><Icon name="pin" size={15}/>有来源的地点</span><span><Icon name="sliders" size={15}/>途中随时调整</span></div>
        <div className="home-hero"><Image src="/images/city-afternoon.webp" alt="绿树与暖阳下的商圈步行街氛围示意" fill priority sizes="(max-width: 760px) 126px, 48vw"/><div className="hero-caption"><span><Icon name="pin" size={16}/>假日广场 × 完美金鹰</span><small>AI 氛围图</small></div></div>
      </section>
      <PlannerForm initial={input} key={JSON.stringify(input)}/>
    </div>
    <section className="inspiration-section" id="inspiration" aria-labelledby="inspiration-title"><div className="section-heading"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2 id="inspiration-title">还没想好？从这里出发</h2></div><span className="section-note">点一条，看看今天的可能</span></div>
      <div className="inspiration-grid">{inspirations.map((item, index) => <Link className="inspiration-card" key={item.scene} href={`/trip?${queryString(parseInput({ scene: item.scene, duration: "240", budget: item.budget, walking: "low", request: item.request }))}`}>
        <div className="inspiration-image"><Image src={`/images/${item.image}.webp`} alt="" fill sizes="(max-width: 760px) 105px, 33vw"/><span>{item.tag}</span></div><div className="inspiration-content"><small>0{index + 1} / 半日灵感</small><h3>{item.title}</h3><p>{item.meta}</p><span className="card-arrow"><Icon name="arrow"/></span></div>
      </Link>)}</div>
    </section>
    <div className="home-guide-link"><div><strong>围绕中山真实商圈，安排下一站</strong><p>公开地点资料、到店提示，还有可以直接体验的途中重排。</p></div><Link href="/guide" className="text-link">看看商圈指南<Icon name="arrow" size={17}/></Link></div>
    <InstallTip/><footer className="site-footer"><span>PerfectDay AI · 把半天过成喜欢的样子</span><small>图片为 AI 生成的氛围示意，非商户实拍。</small></footer>
  </main></>;
}
