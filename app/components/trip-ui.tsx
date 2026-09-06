import Image from "next/image";
import Link from "next/link";
import type { TripPlan } from "@/types";
import Icon from "./ui-icon";
export function formatMinutes(value: number) {
  const h = Math.floor(value / 60), m = value % 60;
  return h ? `${h}小时${m ? `${m}分` : ""}` : `${m}分钟`;
}
export function Metrics({ plan }: { plan: TripPlan }) {
  return <dl className="metrics"><div><dt><Icon name="clock" size={16}/>总时长</dt><dd>{formatMinutes(plan.totalMinutes)}</dd></div><div><dt><Icon name="wallet" size={16}/>人均预计</dt><dd>¥{plan.totalPrice}</dd></div><div><dt><Icon name="walk" size={16}/>预计步行</dt><dd>{plan.totalWalkMinutes}<small> 分钟</small></dd></div></dl>;
}
const labels: Record<string, string> = { start: "集合", culture: "阅读", coffee: "咖啡", food: "用餐", shopping: "逛店", family: "亲子", rest: "休息", connector: "换区", activity: "互动体验" };
function amapUrl(keyword: string) {
  return `https://uri.amap.com/search?${new URLSearchParams({ keyword, city: "中山市", view: "map", src: "perfectday-ai", callnative: "1" })}`;
}
export function Timeline({ plan, editUrl }: { plan: TripPlan; editUrl: string }) {
  if (!plan.stops.length) return <div className="empty-state"><Icon name="sun" size={36}/><h2>给今天多一点选择</h2><p>目前的地点库没有符合所有条件的路线。试试增加时间，或减少必去地点。</p><Link href={editUrl} className="secondary-button">修改我的偏好</Link></div>;
  return <ol className="timeline">{plan.stops.map((stop, index) => {
    const image = ["culture", "coffee"].includes(stop.category) ? "coffee-reading" : stop.category === "activity" ? "play-together" : null;
    return <li className={`stop-row ${stop.category === "connector" ? "connector-row" : ""}`} key={stop.id}>
      <div className="time-col"><time>{stop.time}</time><span>{stop.duration} 分钟</span><i aria-hidden="true">{index + 1}</i></div>
      <article className="stop-card">
        <div className="stop-main">
          <div className={`stop-visual ${image ? "has-photo" : ""}`}>{image ? <Image src={`/images/${image}.webp`} alt="活动氛围示意，非门店实拍" fill sizes="(max-width: 760px) 64px, 96px"/> : <Icon name={stop.category === "food" ? "food" : stop.category === "connector" ? "walk" : stop.category === "family" ? "family" : "pin"} size={28}/>}</div>
          <div className="stop-content"><div className="place-meta">{stop.mall} · {stop.floor}</div><h3>{stop.name}</h3><div className="stop-facts"><span>{labels[stop.category]}</span>{stop.indoor && <span>室内</span>}<span>{stop.walkMinutes > 0 ? `步行约 ${stop.walkMinutes} 分` : "集合起点"}</span></div></div>
          <strong className="stop-price">{stop.price ? `约 ¥${stop.price}` : stop.category === "shopping" ? "消费自选" : "免费"}</strong>
        </div>
        <div className="stop-bottom"><details><summary>停留建议<span aria-hidden="true">＋</span></summary><p>{stop.note}</p>{stop.sourceUrl && <a href={stop.sourceUrl} target="_blank" rel="noreferrer">查看地点资料 <Icon name="external" size={13}/></a>}</details><a className="map-link" href={amapUrl(stop.searchKeyword || `${stop.name} ${stop.address}`)} target="_blank" rel="noreferrer" aria-label={`在高德地图查看${stop.name}`}><Icon name="pin" size={15}/>高德地图<Icon name="external" size={13}/></a></div>
      </article>
    </li>;
  })}<li className="timeline-end"><span className="end-dot"/><Icon name="sun" size={17}/>把剩下的时间，留给意外的小惊喜。</li></ol>;
}
