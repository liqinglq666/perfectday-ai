import Link from "next/link";
import type { TripPlan } from "@/types";
import Icon from "./ui-icon";
export function formatMinutes(value: number) {
  const h = Math.floor(value / 60), m = value % 60;
  return h ? `${h}小时${m ? `${m}分` : ""}` : `${m}分钟`;
}
export function Metrics({ plan, remaining = false }: { plan: TripPlan; remaining?: boolean }) {
  return <dl className="metrics"><div><dt><Icon name="clock" size={16}/>{remaining ? "已安排" : "总时长"}</dt><dd>{formatMinutes(plan.totalMinutes)}</dd></div><div><dt><Icon name="wallet" size={16}/>{remaining ? "预计花费" : "人均预计"}</dt><dd>¥{plan.totalPrice}</dd></div><div><dt><Icon name="walk" size={16}/>预计步行</dt><dd>{plan.totalWalkMinutes}<small> 分钟</small></dd></div></dl>;
}
const labels: Record<string, string> = { start: "集合", culture: "阅读", coffee: "咖啡", food: "用餐", shopping: "逛店", family: "亲子", rest: "休息", connector: "换区", activity: "互动体验" };
const categoryIcons: Record<string, string> = { start: "pin", culture: "book", coffee: "coffee", food: "food", shopping: "wallet", family: "family", rest: "sun", connector: "walk", activity: "users" };
export function amapUrl(keyword: string) {
  return `https://uri.amap.com/search?${new URLSearchParams({ keyword, city: "中山市", view: "map", src: "perfectday-ai", callnative: "1" })}`;
}
export function Timeline({ plan, editUrl, startAt = 1 }: { plan: TripPlan; editUrl: string; startAt?: number }) {
  if (!plan.stops.length) return <div className="empty-state"><Icon name="sun" size={36}/><h2>给今天多一点选择</h2><p>目前的地点库没有符合所有条件的路线。试试增加时间，或减少必去地点。</p><Link href={editUrl} className="secondary-button">修改我的偏好</Link></div>;
  return <ol className="timeline">{plan.stops.map((stop, index) => {
    return <li className={`stop-row ${stop.category === "connector" ? "connector-row" : ""}`} key={stop.id}>
      <div className="time-col"><time>{stop.time}</time><span>{stop.duration} 分钟</span><i aria-hidden="true">{String(index + startAt).padStart(2, "0")}</i></div>
      <article className="stop-card">
        <div className="stop-main">
          <div className="stop-visual"><Icon name={categoryIcons[stop.category] || "pin"} size={28}/></div>
          <div className="stop-content"><div className="place-meta">{stop.mall} · {stop.floor}</div><h3>{stop.name}</h3><div className="stop-facts"><span>{labels[stop.category]}</span>{stop.indoor && <span>室内</span>}<span>{stop.walkMinutes > 0 ? `步行约 ${stop.walkMinutes} 分` : "集合起点"}</span></div></div>
          <strong className="stop-price">{stop.price ? `约 ¥${stop.price}` : ["shopping", "culture"].includes(stop.category) ? "消费自选" : "不计消费"}</strong>
        </div>
        <div className="stop-bottom"><details><summary>停留建议<span aria-hidden="true">＋</span></summary><p>{stop.note}</p><p className="source-note">{stop.sourceLabel} · 资料查阅 {stop.checkedAt || "待更新"}。{stop.evidenceNote || "公开资料供出发前参考，非实时营业或实地核验。"}</p>{stop.sourceUrl && <a href={stop.sourceUrl} target="_blank" rel="noreferrer">查看地点资料 <Icon name="external" size={13}/></a>}</details><a className="map-link" href={amapUrl(stop.searchKeyword || `${stop.name} ${stop.address}`)} target="_blank" rel="noreferrer" aria-label={`在高德地图查看${stop.name}`}><Icon name="pin" size={15}/>高德地图<Icon name="external" size={13}/></a></div>
      </article>
    </li>;
  })}<li className="timeline-end"><span className="end-dot"/><Icon name="sun" size={17}/>把剩下的时间，留给意外的小惊喜。</li></ol>;
}
