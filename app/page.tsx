import Image from "next/image";
import Link from "next/link";
import { generateTrip } from "@/app/actions";
import SubmitButton from "@/app/submit-button";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import InstallTip from "@/app/components/install-tip";
import { parseInput, queryString } from "@/lib/planner";
export const maxDuration = 30;
const scenes = [["date", "heart", "约会"], ["family", "family", "亲子"], ["parents", "users", "陪爸妈"], ["friends", "users", "朋友"], ["solo", "coffee", "独处"], ["rain", "rain", "雨天"]];
const inspirations = [
  { scene: "solo", tag: "留点时间给自己", title: "书店与咖啡的慢时光", meta: "翻几页书，再喝一杯喜欢的咖啡", image: "coffee-reading", request: "想逛书店、喝咖啡，轻松一点", budget: "300" },
  { scene: "friends", tag: "朋友的快乐集合", title: "一起玩，才够尽兴", meta: "互动运动与咖啡，安排一场轻松小聚", image: "play-together", request: "和朋友玩游戏或运动，再喝咖啡", budget: "300" },
  { scene: "family", tag: "一家人的小出游", title: "把快乐安排在室内", meta: "亲子乐园、慢逛，还有休息的时间", image: "city-afternoon", request: "带孩子逛4小时，尽量室内，少走路", budget: "500" }
];
export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const input = parseInput(await searchParams, false);
  const durations = [...new Set([90, 120, 180, 240, 360, 480, input.duration])].sort((a, b) => a - b);
  return <><Header/><main id="main-content" className="page home-page">
    <div className="planning-layout">
      <section className="home-intro" aria-labelledby="home-title">
        <p className="eyebrow"><span/>一个商圈，许多种好时光</p>
        <h1 id="home-title">今天，<br className="desktop-break"/><em>慢慢逛。</em></h1>
        <p className="intro-copy">从一杯咖啡到一顿好饭，<br/>把喜欢的地方串成一条顺路的行程。</p>
        <div className="home-hero"><Image src="/images/city-afternoon.webp" alt="绿树与暖阳下的商圈步行街氛围示意" fill priority sizes="(max-width: 760px) 100vw, 48vw"/><div className="hero-caption"><span><Icon name="pin" size={16}/>假日广场 × 完美金鹰</span><small>AI 氛围图</small></div></div>
      </section>
      <form action={generateTrip} className="planner-panel">
        <div className="panel-heading"><span className="mini-mark"><Icon name="sparkles"/></span><div><h2>安排你的半日行程</h2><p>告诉我想法，剩下的交给规划。</p></div></div>
        <div className="request-field"><label htmlFor="request">今天想怎么玩？<span>选填</span></label><textarea id="request" name="request" defaultValue={input.request} maxLength={600} rows={3} placeholder="比如：带爸妈逛四小时，预算300元，想逛书店，不喝咖啡，少走路" aria-describedby="request-help"/><p id="request-help">写下偏好和不想去的地方，描述会优先用于规划。</p></div>
        <fieldset><legend>和谁一起？</legend><div className="scene-grid">{scenes.map(([value, icon, label]) => <label className="scene-option" key={value}><input type="radio" name="scene" value={value} defaultChecked={input.scene === value}/><span><Icon name={icon}/><strong>{label}</strong></span></label>)}</div></fieldset>
        <fieldset><legend>按你的节奏来</legend><div className="preferences">
          <label><span><Icon name="clock" size={16}/>空闲时间</span><select name="duration" defaultValue={input.duration}>{durations.map((duration) => <option key={duration} value={duration}>{duration % 60 === 0 ? `${duration / 60} 小时` : `${duration} 分钟`}</option>)}</select></label>
          <label><span><Icon name="wallet" size={16}/>人均预算</span><select name="budget" defaultValue={input.budget}><option value="100">¥100 内</option><option value="300">¥300 内</option><option value="500">¥500 内</option><option value="plus">¥800 内</option></select></label>
          <label><span><Icon name="walk" size={16}/>步行偏好</span><select name="walking" defaultValue={input.walking}><option value="low">少走一点</option><option value="normal">正常步行</option></select></label>
        </div></fieldset>
        <SubmitButton/><div className="form-reassurance"><Icon name="check" size={15}/>生成后可随时调整，不用重新填写</div>
      </form>
    </div>
    <section className="inspiration-section" id="inspiration" aria-labelledby="inspiration-title"><div className="section-heading"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2 id="inspiration-title">还没想好？从这里出发</h2></div><span className="section-note">点一条，看看今天的可能</span></div>
      <div className="inspiration-grid">{inspirations.map((item, index) => <Link className="inspiration-card" key={item.scene} href={`/trip?${queryString(parseInput({ scene: item.scene, duration: "240", budget: item.budget, walking: "low", request: item.request }))}`}>
        <div className="inspiration-image"><Image src={`/images/${item.image}.webp`} alt="" fill sizes="(max-width: 760px) 76vw, 33vw"/><span>{item.tag}</span></div><div className="inspiration-content"><small>0{index + 1} / 半日灵感</small><h3>{item.title}</h3><p>{item.meta}</p><span className="card-arrow"><Icon name="arrow"/></span></div>
      </Link>)}</div>
    </section>
    <InstallTip/><footer className="site-footer"><span>PerfectDay AI · 把半天过成喜欢的样子</span><small>图片为 AI 生成的氛围示意，非商户实拍。</small></footer>
  </main></>;
}
