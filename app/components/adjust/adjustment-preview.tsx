import type { RefObject } from "react";
import Icon from "@/app/components/ui-icon";
import { formatMinutes } from "@/lib/format";
import type { Journey } from "@/lib/journey";
import type { TripPlan } from "@/types";

type RemovedStop = { id: string; name: string; reason: string };

type Props = {
  valid: boolean;
  doneCount: number;
  journey: Journey;
  plan: TripPlan;
  before: TripPlan;
  removed: RemovedStop[];
  previewRef: RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
};

export default function AdjustmentPreview({ valid, doneCount, journey, plan, before, removed, previewRef, onReset }: Props) {
  const count = plan.stops.filter(stop => stop.category !== "connector").length;

  return <>
    <div className="section-heading">
      <div><span className="live-preview"><i/>即时预览</span><h2 id="preview-title" ref={previewRef} tabIndex={-1}>接下来这样逛</h2></div>
      <span className="status"><Icon name="check" size={13}/>保留 {doneCount} 站记录</span>
    </div>
    {valid ? <>
      <div className="comparison-grid">
        <div><small>后续时长</small><strong>{formatMinutes(plan.totalMinutes)}</strong>{before.totalMinutes !== plan.totalMinutes && <span>原来 {formatMinutes(before.totalMinutes)}</span>}</div>
        <div><small>预计消费 / 人</small><strong>¥{plan.totalPrice}</strong>{before.totalPrice !== plan.totalPrice && <span>原来 ¥{before.totalPrice}</span>}</div>
        <div><small>预计步行</small><strong>{plan.totalWalkMinutes}<em> 分钟</em></strong>{before.totalWalkMinutes !== plan.totalWalkMinutes && <span>原来 {before.totalWalkMinutes} 分钟</span>}</div>
      </div>
      <p className="applied-banner"><Icon name="sun" size={18}/>{count ? `保留 ${count} 个停留点，预留 ${Math.max(0, journey.minutes - plan.totalMinutes)} 分钟机动。` : "没有合适的后续地点，可以放宽条件再看看。"}</p>
      <span className="sr-only" aria-live="polite">后续{count}个停留点，预计{plan.totalMinutes}分钟，{plan.totalPrice}元。</span>
      {plan.stops.length ? <ol className="adjust-list">{plan.stops.map((stop, index) => <li key={stop.id}>
        <span className="adjust-number">{String(index + 1).padStart(2, "0")}</span>
        <div><time>{stop.time} 起 · 停留 {stop.duration} 分钟</time><h3>{stop.name}</h3><small>{stop.mall}</small></div>
        {stop.status === "replaced" && <span className="status replaced">现场备选</span>}
      </li>)}</ol> : <div className="empty-state">
        <Icon name="sun" size={32}/><h3>给今天留一点自由</h3><p>可以增加剩余时间、放宽预算，或保留已完成记录结束这一段。</p>
        <button className="text-link" type="button" onClick={onReset}>恢复调整前的安排<Icon name="back" size={16}/></button>
      </div>}
      {removed.length > 0 && <details className="removed-stops" open>
        <summary>为什么移除这 {removed.length} 个停留点？</summary>
        <ul>{removed.map(stop => <li key={stop.id}><strong>{stop.name}</strong><small>{stop.reason}</small></li>)}</ul>
      </details>}
    </> : <div className="empty-state"><Icon name="sliders" size={30}/><h3>补齐条件，就能看到新安排</h3><p>已完成的记录不会受到影响。</p></div>}
  </>;
}
