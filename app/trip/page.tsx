import Image from "next/image";
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
  rain: "已切换为更适合雨天的路线",
  walk: "已减少不必要步行",
  budget: "已降低可选消费",
  queue: "已替换排队餐厅"
};

const activityLabels: Record<string, string> = {
  start: "集合",
  culture: "逛逛",
  coffee: "咖啡",
  food: "吃饭",
  shopping: "逛店",
  family: "亲子",
  rest: "休息",
  connector: "换区",
  activity: "玩一会"
};

export default async function TripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const input = parseInput(params);
  const change = parseChange(params.change);
  const plan = change ? adjustPlan(input, change) : createPlan(input);
  const qs = queryString(input);

  return (
    <div className="page trip-page">
      <header className="topbar"><Link href="/" aria-label="返回">‹</Link><strong>你的行程</strong><span /></header>

      {change && <div className="applied-banner">✓ {changeLabels[change]}</div>}

      <section className="trip-hero">
        <p className="planning-status">{input.intentSource === "bailian" ? "已按 AI 理解的偏好规划" : input.intentSource === "fallback" ? "AI 暂时不可用，已使用基础规划" : "基础路线规划"}</p>
        <h1>{plan.title}</h1>
        <p>{plan.subtitle}</p>
        <div className="metrics">
          <div><small>总时长</small><strong>{formatMinutes(plan.totalMinutes)}</strong></div>
          <div><small>预计消费</small><strong>¥{plan.totalPrice}</strong></div>
          <div><small>预计步行</small><strong>{plan.totalWalkMinutes} 分</strong></div>
        </div>
      </section>

      <section className="timeline compact-timeline">
        {plan.stops.map((stop, index) => (
          <article className="stop-row" key={`${stop.id}-${index}`}>
            <div className="time-col"><strong>{stop.time}</strong><span>{stop.duration}分</span><i /></div>
            <div className="stop-card visual-stop-card compact-stop-card">
              <div className="place-visual">
                <Image src={stop.visual} alt="" width={96} height={120} sizes="96px" />
                <span className="visual-number">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="stop-content">
                <div className="place-meta"><span>{stop.mall} · {stop.floor}</span></div>
                <div className="stop-title"><h2>{stop.name}</h2><strong>{stop.price ? `约 ¥${stop.price}` : "免费"}</strong></div>
                <div className="stop-facts">
                  <span>{activityLabels[stop.category] || "逛逛"}</span>
                  {stop.indoor && <span>室内</span>}
                  {stop.walkMinutes > 0 && <span>步行 {stop.walkMinutes} 分</span>}
                </div>
                <div className="stop-actions">
                  <a target="_blank" rel="noreferrer" href={amapSearchUrl(stop.searchKeyword || `${stop.name} ${stop.address}`)}>⌖ 高德地图</a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="sticky-actions">
        <Link className="primary-button compact" href={`/adjust?${qs}${change ? `&change=${change}` : ""}`}>调整行程</Link>
        <Link className="secondary-button" href="/">重新规划</Link>
      </div>
    </div>
  );
}
