import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { Metrics, Timeline, formatMinutes } from "@/app/components/trip-ui";
import ShareTrip from "@/app/components/share-trip";
import { parseInput, queryString } from "@/lib/planner";
import { advanceJourney, clockText, decodeJourney, journeyPlan, journeyUrl, mallName, readJourney, resolveStop } from "@/lib/journey";
export default async function TripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams, input = parseInput(params), journey = readJourney(input, params);
  const plan = journeyPlan(journey, input), editUrl = `/?${queryString(input)}`;
  const adjustUrl = journeyUrl(input, journey, "/adjust"), next = plan.stops[0];
  const doneCount = journey.done.filter(stop => stop.id !== "connector").length;
  const leftCount = plan.stops.filter(stop => stop.category !== "connector").length;
  const total = doneCount + leftCount + journey.skipped.filter(id => id !== "connector").length;
  const status = input.intentSource === "bailian" ? "已按 AI 理解的偏好规划" : input.intentSource === "fallback" ? "AI 暂时不可用，已使用基础规划" : "基础路线规划";
  return <><Header/><main id="main-content" className="page trip-page"><Link className="back-link" href={editUrl}><Icon name="back" size={17}/>修改偏好，开始新行程</Link>
    {params.journey && !decodeJourney(params.journey) && <p role="alert" className="applied-banner">进度链接不完整，已显示初始路线。请从原来的完整链接继续。</p>}
    <div className="trip-layout"><aside className="trip-summary"><p className="eyebrow">YOUR PERFECT DAY · 随行助手</p><h1>{plan.title}</h1><p className="summary-copy">逛到哪，记到哪。把下一段留给此刻的心情。</p><span className="planning-status"><Icon name="sparkles" size={15}/>{status}</span><Metrics plan={plan} remaining/>
      <div className="remaining-budget"><span>还可安排 <strong>{formatMinutes(journey.minutes)}</strong></span><span>剩余预算 <strong>¥{journey.cash}/人</strong></span><Link href={adjustUrl}>修改时间与预算 <Icon name="arrow" size={14}/></Link></div>
      {input.request && <div className="request-quote"><small>你想要的今天</small><p>{input.request}</p></div>}
      <div className="route-actions"><Link className="primary-button" href={adjustUrl}><Icon name="sliders"/>重排剩余行程<Icon name="arrow"/></Link><ShareTrip href={journeyUrl(input, journey)}/></div>
      <p className="estimate-note">下一段从 {clockText(journey.clock)} 开始，可在调整页修改。完成一站会按预计时间与消费扣减，请按实际情况修正余额。进度保存在链接中，刷新可继续；分享也会包含需求文字与进度。</p>
      <Link className="text-link" href="/guide">商圈资料与到店提示 <Icon name="external" size={14}/></Link>
    </aside><section className="itinerary" aria-labelledby="itinerary-title">
      <div className="journey-progress"><div><span className="eyebrow">ON THE WAY</span><strong>已完成 {doneCount} 站<span> / {total} 站</span></strong></div><span className="progress-location"><Icon name="pin" size={14}/>{mallName(journey.current)}</span><progress aria-label="行程完成进度" max={Math.max(1, total)} value={doneCount}/></div>
      {journey.done.length > 0 && <details className="completed-history"><summary><Icon name="check" size={17}/>已完成的记录 · 调整时保留</summary><ol>{journey.done.map(visit => <li key={visit.id}><time>{clockText(visit.t)}</time><span>{resolveStop(visit).name}<small>原安排 {visit.d + visit.w} 分钟 · 预计 ¥{visit.p}</small></span><Icon name="check" size={15}/></li>)}</ol></details>}
      {next ? <div className="next-stop-panel"><div><small>{next.category === "connector" ? "接下来换区" : "下一站"} · {next.time} 起</small><h2>{next.name}</h2><p>先完成这一站，后续安排随你调整。</p></div><div className="next-stop-actions"><Link prefetch={false} scroll={false} className="primary-button" href={journeyUrl(input, advanceJourney(input, journey))}><Icon name="check" size={17}/>{next.category === "connector" ? "已到另一商场" : "这一站逛完了"}</Link><Link prefetch={false} scroll={false} className="text-link" href={journeyUrl(input, advanceJourney(input, journey, true))}>{next.category === "connector" ? "不换商场了" : "跳过这一站"}</Link></div></div> : <div className="journey-finish"><Icon name="sun" size={30}/><h2>{doneCount ? "这一段，告一段落。" : "给下一段留一点余地。"}</h2><p>{doneCount ? `已留下 ${doneCount} 站记录。` : "当前条件下没有可继续的地点。"}保存后的地点不会自动重新加入。想恢复刚才的候选安排，可用浏览器返回；也可以开始新行程。</p><Link href={editUrl} className="secondary-button">规划新行程</Link></div>}
      <div className="section-heading"><h2 id="itinerary-title">{doneCount ? "剩下的路线" : "今天的路线"}</h2><span className="section-note">{leftCount} 个停留点 · 预留 {Math.max(0, journey.minutes - plan.totalMinutes)} 分钟机动</span></div>
      {plan.stops.length > 0 && <Timeline plan={plan} editUrl={editUrl}/>}
      {journey.skipped.length > 0 && <details className="removed-stops"><summary>已跳过 {journey.skipped.length} 项</summary><ul>{journey.skipped.map(id => <li key={id}>{resolveStop({ id }).name}</li>)}</ul></details>}
      <p className="photo-note">时间、消费与步行均为估算，购物另计；营业与通行以现场为准。卡片图片为 AI 氛围示意，非商户实拍。</p>
    </section></div></main></>;
}
