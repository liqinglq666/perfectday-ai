import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { Metrics } from "@/app/components/trip-ui";
import { parseChanges, parseInput, queryString } from "@/lib/planner";
import { applyRemainingFields, clockText, journeyPlan, journeyUrl, readJourney, replanRemaining } from "@/lib/journey";
const choices = [["rain", "rain", "下雨了", "留在一个商场的室内"], ["walk", "walk", "想少走路", "优先留在当前商场"], ["budget", "wallet", "再省一点", "减少一项付费安排"], ["queue", "queue", "餐厅排队", "改为现场自选餐厅"]] as const;
export default async function AdjustPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams, input = parseInput(params), original = readJourney(input, { ...params, changes: undefined, change: undefined });
  const draft = applyRemainingFields(original, params), changes = parseChanges(params);
  const { journey, removed } = replanRemaining(input, draft, changes), plan = journeyPlan(journey, input);
  const basePlan = journeyPlan(original, input), fields = new URLSearchParams(queryString(input));
  const doneCount = journey.done.filter(stop => stop.id !== "connector").length;
  return <><Header/><main id="main-content" className="page adjust-page"><Link className="back-link" href={journeyUrl(input, original)}><Icon name="back" size={17}/>取消调整，返回行程</Link><div className="adjust-layout">
    <section className="adjust-options"><p className="eyebrow">JUST THE REST OF YOUR DAY</p><h1>已经走过的，<br/><em>好好留住。</em></h1><p className="summary-copy">已完成 {doneCount} 站的记录会保留。<br/>从现在的位置，安排接下来的时间。</p>
      <form action="/adjust" className="remaining-form" key={JSON.stringify(params)}>
        {[...fields].map(([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}<input type="hidden" name="journey" value={JSON.stringify(original)}/>
        <div className="remaining-fields"><label>还能逛多久（分钟）<input type="number" inputMode="numeric" name="left" min="0" max="480" step="1" required defaultValue={draft.minutes}/></label><label>剩余预算（元 / 人）<input type="number" inputMode="numeric" name="cash" min="0" max="10000" step="1" required defaultValue={draft.cash}/></label><label>下一段出发时间<input type="time" name="from" required defaultValue={clockText(draft.clock)}/></label><label>现在所在商场<select name="current" defaultValue={draft.current}><option value="">尚未开始</option><option value="holiday">假日广场</option><option value="golden">石岐万象汇</option></select></label></div>
        <fieldset><legend>途中发生了什么？<span>可多选</span></legend><div className="change-grid">{choices.map(([value, icon, label, hint]) => <label className="change-option" key={value}><input type="checkbox" name="changes" value={value} defaultChecked={changes.includes(value)}/><Icon name={icon} size={24}/><span><strong>{label}</strong><small>{hint}</small></span></label>)}</div></fieldset>
        <p className="selection-hint">手动记录位置，不自动定位。时间包含步行，预算不含额外购物；餐厅备选不代表实时空位。</p><button type="submit" className="primary-button">预览剩余路线<Icon name="arrow"/></button>
      </form>
    </section>
    <section className="replan-card"><div className="section-heading"><h2>接下来这样逛</h2><span className="status">已完成 {doneCount} 站不变</span></div><Metrics plan={plan} remaining/>
      <p className="applied-banner"><Icon name="check" size={18}/>{removed.length ? `减少 ${removed.length} 个停留点` : "保留剩余停留点"} · 预留 {Math.max(0, journey.minutes - plan.totalMinutes)} 分钟机动{basePlan.totalPrice > plan.totalPrice ? ` · 预计少花 ¥${basePlan.totalPrice - plan.totalPrice}` : ""}</p>
      {plan.stops.length ? <ol className="adjust-list">{plan.stops.map((stop, index) => <li key={stop.id}><span className="adjust-number">{String(index + 1).padStart(2, "0")}</span><div><time>{stop.time} 起 · 停留 {stop.duration} 分钟</time><h3>{stop.name}</h3><small>{stop.mall}</small></div><span className={`status ${stop.status === "replaced" ? "replaced" : ""}`}>{stop.status === "replaced" ? "现场备选" : "保留"}</span></li>)}</ol> : <div className="empty-state"><h3>余下时间可以自由安排</h3><p>没有符合当前时间、预算和位置的剩余地点。可以放宽左侧条件再预览，或保留已完成记录结束本段。</p></div>}
      {removed.length > 0 && <details className="removed-stops" open><summary>为什么移除这 {removed.length} 个停留点？</summary><ul>{removed.map(stop => <li key={stop.id}>{stop.name}<small>{stop.reason}</small></li>)}</ul></details>}
      <Link className="primary-button use-route" href={journeyUrl(input, journey)}>{plan.stops.length ? "保存，继续这段行程" : "保存，结束这段行程"}<Icon name="arrow"/></Link><p className="estimate-note">保存后仅保留这次选定的后续地点。想撤销刚才的操作，可用浏览器返回。</p>
    </section></div></main></>;
}
