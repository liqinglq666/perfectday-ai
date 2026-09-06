import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { Metrics, Timeline } from "@/app/components/trip-ui";
import { adjustPlan, changeQuery, createPlan, describeChanges, parseChanges, parseInput, queryString } from "@/lib/planner";
export default async function TripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams, input = parseInput(params), changes = parseChanges(params);
  const base = createPlan(input), plan = changes.length ? adjustPlan(input, changes) : base;
  const qs = queryString(input), suffix = changeQuery(changes), editUrl = `/?${qs}`;
  const status = input.intentSource === "bailian" ? "已按 AI 理解的偏好规划" : input.intentSource === "fallback" ? "AI 暂时不可用，已使用基础规划" : "基础路线规划";
  return <><Header/><main id="main-content" className="page trip-page"><Link className="back-link" href={editUrl}><Icon name="back" size={17}/>修改偏好</Link>
    <div className="trip-layout"><aside className="trip-summary"><p className="eyebrow">YOUR PERFECT DAY</p><h1>{plan.title}</h1><p className="summary-copy">{plan.subtitle}</p><span className="planning-status"><Icon name="sparkles" size={15}/>{status}</span><Metrics plan={plan}/>
      {input.request && <div className="request-quote"><small>你想要的今天</small><p>{input.request}</p></div>}
      <div className="route-actions"><Link className="primary-button" href={`/adjust?${qs}${suffix}`}><Icon name="sliders"/>调整行程<Icon name="arrow"/></Link><Link className="secondary-button" href={editUrl}>重新规划</Link></div>
      <p className="estimate-note">时间以 14:00 出发为示例，可按实际出发时间顺延。消费与步行均为估算，购物另计；营业、票价和通行情况请以现场为准。</p>
    </aside><section className="itinerary" aria-labelledby="itinerary-title"><div className="section-heading"><h2 id="itinerary-title">今天的路线</h2><span className="section-note">{plan.stops.filter(stop => stop.category !== "connector").length} 个停留点 · 顺路慢逛</span></div>
      {changes.length > 0 && <p className="applied-banner"><Icon name="check" size={18}/>{describeChanges(base, plan)}</p>}
      <Timeline plan={plan} editUrl={editUrl}/><p className="photo-note">卡片图片为 AI 氛围示意，非商户实拍。</p>
    </section></div></main></>;
}
