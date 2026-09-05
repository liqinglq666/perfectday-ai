import Link from "next/link";
import { adjustPlan, createPlan, parseChange, parseInput, queryString } from "@/lib/planner";

const changes = [
  ["rain", "☂", "下雨了", "尽量走室内"],
  ["walk", "♙", "少走路", "减少绕行"],
  ["budget", "¥", "预算减少", "减少可选消费"],
  ["queue", "◌", "餐厅排队", "换个吃饭选择"]
] as const;

function statusLabel(status?: string) {
  if (status === "replaced") return "已替换";
  if (status === "shortened") return "已缩短";
  if (status === "kept") return "保留";
  return "当前";
}

export default async function AdjustPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const input = parseInput(params);
  const change = parseChange(params.change);
  const plan = change ? adjustPlan(input, change) : createPlan(input);
  const base = queryString(input);

  return (
    <div className="page adjust-page">
      <header className="topbar"><Link href={`/trip?${base}${change ? `&change=${change}` : ""}`} aria-label="返回行程">‹</Link><strong>调整行程</strong><span /></header>

      <section className="change-panel">
        <div className="section-heading"><h2>现在需要调整什么？</h2></div>
        <div className="change-grid">
          {changes.map(([value, icon, label, hint]) => (
            <Link className={change === value ? "selected" : ""} href={`/adjust?${base}&change=${value}`} key={value}>
              <b>{icon}</b><span><strong>{label}</strong><small>{hint}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="replan-card">
        <div className="replan-heading">
          <div>
            <h1>{change ? "路线已更新" : "当前路线"}</h1>
            <p>{change ? "只调整需要变化的部分。" : "选一个情况，马上预览新的安排。"}</p>
          </div>
        </div>
        <div className="metrics compact-metrics"><div><small>总时长</small><strong>{Math.floor(plan.totalMinutes / 60)}小时{plan.totalMinutes % 60}分</strong></div><div><small>预算</small><strong>¥{plan.totalPrice}</strong></div><div><small>步行</small><strong>{plan.totalWalkMinutes} 分</strong></div></div>

        <div className="adjust-list compact-adjust-list">
          {plan.stops.map((stop, index) => (
            <article key={`${stop.id}-${index}`}>
              <time>{stop.time}</time>
              <div><h3>{stop.name}</h3><small>{stop.mall}</small></div>
              <span className={`status ${stop.status || "current"}`}>{statusLabel(stop.status)}</span>
            </article>
          ))}
        </div>
      </section>

      {change && <div className="sticky-actions single"><Link className="primary-button compact" href={`/trip?${base}&change=${change}`}>使用这条路线 →</Link></div>}
    </div>
  );
}
