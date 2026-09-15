import Icon from "@/app/components/ui-icon";
import Timeline from "@/app/components/trip/timeline";
import { clockText, resolveStop, type Journey } from "@/lib/journey";
import type { TripPlan } from "@/types";

type Props = {
  journey: Journey;
  remainingPlan: TripPlan;
  editUrl: string;
  doneCount: number;
};

export default function TripHistory({ journey, remainingPlan, editUrl, doneCount }: Props) {
  const remainingCount = remainingPlan.stops.filter(stop => stop.category !== "connector").length;

  return <section className="itinerary" aria-labelledby="itinerary-title">
    <div className="section-heading">
      <h2 id="itinerary-title">{remainingPlan.stops.length ? "之后还去哪" : "留给自己的空闲"}</h2>
      <span className="section-note">{remainingCount} 个后续停留点</span>
    </div>
    {remainingPlan.stops.length > 0
      ? <Timeline plan={remainingPlan} editUrl={editUrl} startAt={2}/>
      : <p className="route-tail"><Icon name="sun" size={21}/>没有更多固定安排，按自己的节奏慢慢来。</p>}
    {journey.done.length > 0 && <details className="completed-history">
      <summary><Icon name="check" size={17}/><span>已完成的记录 · {doneCount} 站</span><Icon name="arrow" size={15}/></summary>
      <ol>{journey.done.map(visit => <li key={visit.id}>
        <time>{clockText(visit.t)}</time>
        <span>{resolveStop(visit).name}<small>原安排 {visit.d + visit.w} 分钟 · 预计 ¥{visit.p}</small></span>
        <Icon name="check" size={15}/>
      </li>)}</ol>
    </details>}
    {journey.skipped.length > 0 && <details className="removed-stops">
      <summary>已跳过 {journey.skipped.length} 项</summary>
      <ul>{journey.skipped.map(id => <li key={id}>{resolveStop({ id }).name}</li>)}</ul>
    </details>}
    <p className="photo-note">时间、消费与步行均为规划估算，营业、排队与实际通行情况以现场为准。</p>
  </section>;
}
