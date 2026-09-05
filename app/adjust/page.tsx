import Link from "next/link";
import { adjustPlan, parseChange, parseInput, queryString } from "@/lib/planner";

const changes = [
  ["rain", "☂", "下雨了", "尽量切到室内"],
  ["walk", "♙", "少走路", "进一步减少绕行"],
  ["budget", "¥", "预算减少", "删掉一项可选消费"],
  ["queue", "◌", "餐厅排队太久", "改为现场餐饮备选"]
] as const;

function statusLabel(status?: string) {
  if (status === "replaced") return "已替换";
  if (status === "shortened") return "已缩短";
  return "已保留";
}

export default async function AdjustPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const input = parseInput(params);
  const change = parseChange(params.change) ?? "rain";
  const plan = adjustPlan(input, change);
  const base = queryString(input);

  return (
    <div className="page adjust-page">
      <header className="topbar"><Link href={`/trip?${base}`}>‹</Link><strong>动态调整</strong><span>不必重新规划</span></header>

      <section className="change-panel">
        <div className="section-heading"><h2>发生了什么变化？</h2><span>点一下就重新安排</span></div>
        <div className="change-grid">
          {changes.map(([value, icon, label, hint]) => (
            <Link className={change === value ? "selected" : ""} href={`/adjust?${base}&change=${value}`} key={value}>
              <b>{icon}</b><span><strong>{label}</strong><small>{hint}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="replan-card">
        <div className="replan-heading"><div><span>✦</span><h1>已为你重排路线</h1><p>只改必要部分，不伪造实时排队或室内导航数据。</p></div><em>更轻松<br/>更合适</em></div>
        <div className="metrics compact-metrics"><div><small>新总时长</small><strong>{Math.floor(plan.totalMinutes / 60)}小时{plan.totalMinutes % 60}分</strong></div><div><small>新预算</small><strong>¥{plan.totalPrice}</strong></div><div><small>步行</small><strong>{plan.totalWalkMinutes} 分</strong></div></div>

        <div className="adjust-list">
          {plan.stops.map((stop, index) => (
            <article key={`${stop.id}-${index}`}>
              <time>{stop.time}</time>
              <div className={`mini-art ${stop.accent}`}>{stop.icon}</div>
              <div><h3>{stop.name}</h3><p>{stop.note}</p></div>
              <span className={`status ${stop.status}`}>{statusLabel(stop.status)}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="sticky-actions single"><Link className="primary-button compact" href={`/trip?${base}&change=${change}`}>✦ 应用新方案 →</Link></div>
    </div>
  );
}
