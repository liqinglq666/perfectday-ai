import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { Metrics } from "@/app/components/trip-ui";
import { adjustPlan, changeQuery, createPlan, describeChanges, parseChanges, parseInput, queryString } from "@/lib/planner";
const choices = [["rain", "rain", "下雨了", "去掉室外停留"], ["walk", "walk", "想少走路", "集中在一个商场"], ["budget", "wallet", "预算减少", "减少一项付费安排"], ["queue", "queue", "餐厅排队", "改为现场自选餐厅"]] as const;
export default async function AdjustPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams, input = parseInput(params), changes = parseChanges(params);
  const base = createPlan(input), plan = changes.length ? adjustPlan(input, changes) : base;
  const qs = queryString(input), suffix = changeQuery(changes);
  const removed = base.stops.filter(stop => stop.category !== "connector" && !plan.stops.some(item => item.id === stop.id));
  return <><Header/><main id="main-content" className="page adjust-page"><Link className="back-link" href={`/trip?${qs}${suffix}`}><Icon name="back" size={17}/>返回行程</Link><div className="adjust-layout">
    <section className="adjust-options"><p className="eyebrow">A CHANGE OF PLANS</p><h1>计划随你，<br/><em>轻松变一变。</em></h1><p className="summary-copy">天气、体力、预算都可以变。<br/>选中需要的调整，即刻预览新路线。</p><div className="change-grid">{choices.map(([value, icon, label, hint]) => {
      const selected = changes.includes(value), next = selected ? changes.filter(item => item !== value) : [...changes, value];
      return <Link className={`change-option ${selected ? "selected" : ""}`} aria-current={selected ? "true" : undefined} aria-label={`${label}，${selected ? "已选，点击取消" : "点击选择"}`} key={value} href={`/adjust?${qs}${changeQuery(next)}`} scroll={false}><Icon name={icon} size={24}/><span><strong>{label}</strong><small>{hint}</small></span><span className="selection-check">{selected && <Icon name="check" size={14}/>}</span></Link>;
    })}</div><p className="selection-hint">可以多选 · 再点一次取消</p></section>
    <section className="replan-card"><div className="section-heading"><h2>{changes.length ? "调整后的路线" : "当前路线"}</h2>{changes.length > 0 && <Link className="text-link" href={`/adjust?${qs}`} scroll={false}>重置调整</Link>}</div><Metrics plan={plan}/>
      {changes.length > 0 && <p className="applied-banner"><Icon name="check" size={18}/>{describeChanges(base, plan)}</p>}
      {plan.stops.length ? <ol className="adjust-list">{plan.stops.map((stop, index) => <li key={stop.id}><span className="adjust-number">{String(index + 1).padStart(2, "0")}</span><div><time>{stop.time} · {stop.duration} 分钟</time><h3>{stop.name}</h3><small>{stop.mall}</small></div><span className={`status ${stop.status === "replaced" ? "replaced" : ""}`}>{stop.status === "replaced" ? "已替换" : changes.length ? "保留" : "当前"}</span></li>)}</ol> : <div className="empty-state"><p>这些调整移除了全部地点，请取消部分选项。</p></div>}
      {removed.length > 0 && <details className="removed-stops"><summary>本次移除 {removed.length} 个停留点</summary><ul>{removed.map(stop => <li key={stop.id}>{stop.name}</li>)}</ul></details>}
      <Link className="primary-button use-route" href={`/trip?${qs}${suffix}`}>{changes.length ? "使用这条路线" : "查看完整行程"}<Icon name="arrow"/></Link>
    </section></div></main></>;
}
