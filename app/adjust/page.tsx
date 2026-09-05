import Link from "next/link";
import { adjustPlan, parseInput, queryString } from "@/lib/planner";

const changes = [
  ["rain", "☂", "下雨了"],
  ["walk", "♙", "少走路"],
  ["budget", "¥", "预算减少"],
  ["queue", "◌", "餐厅排队太久"]
];

function statusLabel(status?: string) {
  if (status === "replaced") return "已替换";
  if (status === "shortened") return "已缩短";
  return "已保留";
}

export default async function AdjustPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const input = parseInput(params);
  const change = typeof params.change === "string" ? params.change : "rain";
  const plan = adjustPlan(input, change);
  const base = queryString(input);

  return (
    <div className="page adjust-page">
      <header className="topbar"><Link href={`/trip?${base}`}>‹</Link><strong>动态调整</strong><span>好逛 · 好吃</span></header>

      <section className="change-panel">
        <div className="section-heading"><h2>发生了什么变化？</h2><span>点一下就重新安排</span></div>
        <div className="change-grid">
          {changes.map(([value, icon, label]) => (
            <Link className={change === value ? "selected" : ""} href={`/adjust?${base}&change=${value}`} key={value}><b>{icon}</b>{label}</Link>
          ))}
        </div>
      </section>

      <section className="replan-card">
        <div className="replan-heading"><div><span>✦</span><h1>已为你重排路线</h1><p>只修改必要部分，尽量保留原本的节奏。</p></div><em>更轻松<br/>更合适</em></div>
        <div className="metrics compact-metrics"><div><small>新总时长</small><strong>{Math.floor(plan.totalMinutes / 60)}小时{plan.totalMinutes % 60}分</strong></div><div><small>新预算</small><strong>¥{plan.totalPrice}</strong></div><div><small>步行</small><strong>{plan.totalWalkMinutes} 分</strong></div></div>

        <div className="adjust-list">
          {plan.stops.map((stop) => (
            <article key={stop.id}>
              <time>{stop.time}</time>
              <div className={`mini-art ${stop.accent}`}>{stop.icon}</div>
              <div><h3>{stop.name}</h3><p>{stop.note}</p></div>
              <span className={`status ${stop.status}`}>{statusLabel(stop.status)}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="sticky-actions single"><Link className="primary-button compact" href={`/trip?${base}`}>✦ 应用新方案 →</Link></div>
    </div>
  );
}
