import Link from "next/link";
import { adjustPlan, createPlan, parseChange, parseInput, queryString } from "@/lib/planner";

function formatMinutes(value: number) {
  const h = Math.floor(value / 60);
  const m = value % 60;
  return h ? `${h}小时${m ? `${m}分` : ""}` : `${m}分钟`;
}

function amapSearchUrl(keyword: string) {
  const params = new URLSearchParams({
    keyword,
    city: "中山市",
    view: "map",
    src: "perfectday-ai",
    callnative: "1"
  });
  return `https://uri.amap.com/search?${params.toString()}`;
}

const changeLabels = {
  rain: "已切换为更适合雨天的室内路线",
  walk: "已进一步减少不必要步行",
  budget: "已减少一项可选消费",
  queue: "已避开当前排队餐厅"
};

export default async function TripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const input = parseInput(params);
  const change = parseChange(params.change);
  const plan = change ? adjustPlan(input, change) : createPlan(input);
  const qs = queryString(input);

  return (
    <div className="page trip-page">
      <header className="topbar"><Link href="/" aria-label="返回">‹</Link><strong>PerfectDay AI</strong><span>好逛 · 好吃</span></header>

      {change && <div className="applied-banner">✓ {changeLabels[change]}</div>}

      <section className="trip-hero">
        <div className="eyebrow">YOUR PERFECT HALF DAY</div>
        <h1>{plan.title}</h1>
        <p>{plan.subtitle}</p>
        <div className="metrics">
          <div><small>总时长</small><strong>{formatMinutes(plan.totalMinutes)}</strong></div>
          <div><small>预计消费</small><strong>¥{plan.totalPrice}</strong></div>
          <div><small>预计步行</small><strong>{plan.totalWalkMinutes} 分</strong></div>
        </div>
      </section>

      <div className="route-note"><span>● 已核验核心地点</span><span>消费为规划估算，实际以门店为准</span></div>

      <section className="timeline">
        {plan.stops.map((stop, index) => (
          <article className="stop-row" key={`${stop.id}-${index}`}>
            <div className="time-col"><strong>{stop.time}</strong><span>{stop.duration}分钟</span><i /></div>
            <div className="stop-card">
              <div className={`place-art ${stop.accent}`}><span>{stop.icon}</span><small>{stop.mall}</small></div>
              <div className="stop-content">
                <div className="place-meta"><span>{stop.mall} · {stop.floor}</span>{stop.verified && <b>已核验</b>}</div>
                <div className="stop-title"><h2>{stop.name}</h2><strong>{stop.price ? `约 ¥${stop.price}` : "¥0"}</strong></div>
                <p>{stop.note}</p>
                <div className="stop-actions">
                  <a target="_blank" rel="noreferrer" href={amapSearchUrl(`${stop.name} ${stop.address}`)}>⌖ 高德查看</a>
                  <span>第 {index + 1}/{plan.stops.length} 站</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="sticky-actions">
        <Link className="secondary-button" href={`/adjust?${qs}${change ? `&change=${change}` : ""}`}>☷ 调整行程</Link>
        <Link className="primary-button compact" href="/">↻ 重新生成</Link>
      </div>
    </div>
  );
}
