"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import Icon from "./ui-icon";
import { formatMinutes } from "./trip-ui";
import { applyRemainingFields, clockText, journeyPlan, journeyUrl, replanRemaining, type Journey } from "@/lib/journey";
import { queryString } from "@/lib/planner";
import { UNDO_TRIP_KEY } from "@/lib/trip-storage";
import type { AdjustmentChange, PlanInput } from "@/types";
const choices = [["rain", "rain", "下雨了", "留在一个商场的室内"], ["walk", "walk", "想少走路", "优先留在当前商场"], ["budget", "wallet", "再省一点", "减少一项付费安排"], ["queue", "queue", "餐厅排队", "改为现场自选餐厅"]] as const;
const fieldsOf = (journey: Journey) => ({ left: String(journey.minutes), cash: String(journey.cash), from: clockText(journey.clock), current: journey.current as string });
export default function AdjustEditor({ input, original, initial, initialChanges }: { input: PlanInput; original: Journey; initial: Journey; initialChanges: AdjustmentChange[] }) {
  const [values, setValues] = useState(() => fieldsOf(initial));
  const [changes, setChanges] = useState(initialChanges), [saving, startSaving] = useTransition();
  const router = useRouter();
  const previewRef = useRef<HTMLHeadingElement>(null);
  const draft = applyRemainingFields(original, values);
  const valid = /^\d+$/.test(values.left) && Number(values.left) <= 480 && /^\d+$/.test(values.cash) && Number(values.cash) <= 10000 && /^([01]\d|2[0-3]):[0-5]\d$/.test(values.from);
  const { journey, removed } = replanRemaining(input, draft, changes), plan = journeyPlan(journey, input), before = journeyPlan(original, input);
  const doneCount = original.done.filter(stop => stop.id !== "connector").length;
  const count = plan.stops.filter(stop => stop.id !== "connector").length;
  function update(key: keyof typeof values, value: string) { setValues(previous => ({ ...previous, [key]: value })); }
  function preview() { previewRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); previewRef.current?.focus({ preventScroll: true }); }
  function submit(event: FormEvent<HTMLFormElement>) {
    if (!valid) { event.preventDefault(); return; }
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value !== "save") { event.preventDefault(); preview(); return; }
    event.preventDefault();
    if (saving) return;
    const target = journeyUrl(input, journey);
    try { sessionStorage.setItem(UNDO_TRIP_KEY, JSON.stringify({ from: journeyUrl(input, original), to: target, label: "保存这次调整" })); } catch { /* Saving does not require storage. */ }
    startSaving(() => router.push(target));
  }
  return <main id="main-content" className="page adjust-page"><div className="page-topline"><Link className="back-link" href={journeyUrl(input, original)}><Icon name="back" size={17}/>取消调整，返回行程</Link><span className="quiet-label">途中调整</span></div>
    <header className="adjust-heading"><p className="eyebrow">把下一段，安排得刚刚好</p><h1>计划有变，也没关系。</h1><p>已完成的 {doneCount} 站会保留，只调整还没去的地方。</p></header>
    <div className="adjust-layout"><section className="adjust-options" aria-label="调整条件"><form id="remaining-form" action="/adjust" onSubmit={submit} className="remaining-form" aria-busy={saving}>
      {[...new URLSearchParams(queryString(input))].map(([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}<input type="hidden" name="journey" value={JSON.stringify(original)}/>
      <div className="section-heading"><h2><span className="step-number">01</span>现在的时间与预算</h2><button className="text-link" type="button" onClick={() => { setValues(fieldsOf(original)); setChanges([]); }}>还原本次修改</button></div>
      <div className="remaining-fields"><label>还能逛多久（分钟）<input type="number" inputMode="numeric" name="left" min="0" max="480" step="1" required value={values.left} onChange={event => update("left", event.target.value)}/></label><label>剩余预算（元 / 人）<input type="number" inputMode="numeric" name="cash" min="0" max="10000" step="1" required value={values.cash} onChange={event => update("cash", event.target.value)}/></label><label>下一段出发时间<input type="time" name="from" required value={values.from} onInput={event => update("from", event.currentTarget.value)} onChange={event => update("from", event.target.value)}/></label><label>现在所在商场<select name="current" value={values.current} onChange={event => update("current", event.target.value)}><option value="">尚未开始</option><option value="holiday">假日广场</option><option value="golden">石岐万象汇</option></select></label></div>
      <div className="time-presets"><span>还剩</span>{[30, 60, 120].map(minutes => <button type="button" key={minutes} aria-pressed={values.left === String(minutes)} onClick={() => update("left", String(minutes))}>{minutes} 分钟</button>)}</div>
      <fieldset><legend><span className="step-number">02</span>途中发生了什么？<span className="optional-label">可多选</span></legend><div className="change-grid">{choices.map(([value, icon, label, hint]) => <label className="change-option" key={value}><input type="checkbox" name="changes" value={value} checked={changes.includes(value)} onChange={event => setChanges(previous => event.target.checked ? [...previous, value] : previous.filter(item => item !== value))}/><Icon name={icon} size={23}/><span><strong>{label}</strong><small>{hint}</small></span></label>)}</div></fieldset>
      {!valid && <p className="field-error" role="alert">请填写0–480分钟、0–10000元，以及有效的出发时间。</p>}
      <p className="selection-hint"><Icon name="check" size={14}/>条件变化后，预览会即时更新。</p><button type="submit" className="secondary-button preview-jump" disabled={!valid}>查看调整结果<Icon name="arrow" size={17}/></button>
      <details className="trip-explanation"><summary>预算、位置与排队说明<Icon name="arrow" size={15}/></summary><p>手动记录位置，不自动定位。时间含步行；余额应按实际消费更新，额外购物另计。餐厅备选不代表实时空位。</p></details>
    </form></section>
    <section className="replan-card" aria-labelledby="preview-title"><div className="section-heading"><div><span className="live-preview"><i/>即时预览</span><h2 id="preview-title" ref={previewRef} tabIndex={-1}>接下来这样逛</h2></div><span className="status"><Icon name="check" size={13}/>保留 {doneCount} 站记录</span></div>
      {valid ? <><div className="comparison-grid"><div><small>后续时长</small><strong>{formatMinutes(plan.totalMinutes)}</strong>{before.totalMinutes !== plan.totalMinutes && <span>原来 {formatMinutes(before.totalMinutes)}</span>}</div><div><small>预计消费 / 人</small><strong>¥{plan.totalPrice}</strong>{before.totalPrice !== plan.totalPrice && <span>原来 ¥{before.totalPrice}</span>}</div><div><small>预计步行</small><strong>{plan.totalWalkMinutes}<em> 分钟</em></strong>{before.totalWalkMinutes !== plan.totalWalkMinutes && <span>原来 {before.totalWalkMinutes} 分钟</span>}</div></div>
      <p className="applied-banner"><Icon name="sun" size={18}/>{count ? `保留 ${count} 个停留点，预留 ${Math.max(0, journey.minutes - plan.totalMinutes)} 分钟机动。` : "没有合适的后续地点，可以放宽条件再看看。"}</p>
      <span className="sr-only" aria-live="polite">后续{count}个停留点，预计{plan.totalMinutes}分钟，{plan.totalPrice}元。</span>
      {plan.stops.length ? <ol className="adjust-list">{plan.stops.map((stop, index) => <li key={stop.id}><span className="adjust-number">{String(index + 1).padStart(2, "0")}</span><div><time>{stop.time} 起 · 停留 {stop.duration} 分钟</time><h3>{stop.name}</h3><small>{stop.mall}</small></div>{stop.status === "replaced" && <span className="status replaced">现场备选</span>}</li>)}</ol> : <div className="empty-state"><Icon name="sun" size={32}/><h3>给今天留一点自由</h3><p>可以增加剩余时间、放宽预算，或保留已完成记录结束这一段。</p><button className="text-link" type="button" onClick={() => { setValues(fieldsOf(original)); setChanges([]); }}>恢复调整前的安排<Icon name="back" size={16}/></button></div>}
      {removed.length > 0 && <details className="removed-stops" open><summary>为什么移除这 {removed.length} 个停留点？</summary><ul>{removed.map(stop => <li key={stop.id}><strong>{stop.name}</strong><small>{stop.reason}</small></li>)}</ul></details>}</> : <div className="empty-state"><Icon name="sliders" size={30}/><h3>补齐条件，就能看到新安排</h3><p>已完成的记录不会受到影响。</p></div>}
      <div className="adjust-savebar"><button className="mobile-preview-button" type="button" onClick={preview} disabled={!valid}><Icon name="sliders" size={18}/><span>看新路线<small>{valid ? `${count} 站 · ¥${plan.totalPrice}` : "待填写"}</small></span></button><button className="primary-button use-route" form="remaining-form" type="submit" name="mode" value="save" disabled={!valid || saving} aria-busy={saving}>{saving ? <><span className="spinner"/>正在保存…</> : <>保存这次调整<Icon name="arrow"/></>}</button></div><p className="estimate-note">保存后可撤销上一步。已移除的地点不会自动重新加入。</p>
    </section></div></main>;
}
