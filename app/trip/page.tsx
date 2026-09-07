import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { Metrics, Timeline, formatMinutes, amapUrl } from "@/app/components/trip-ui";
import ShareTrip from "@/app/components/share-trip";
import ActionLink from "@/app/components/action-link";
import { RememberTrip } from "@/app/components/trip-memory";
import { parseInput, queryString } from "@/lib/planner";
import { advanceJourney, clockText, decodeJourney, journeyPlan, journeyUrl, mallName, readJourney, resolveStop } from "@/lib/journey";
export default async function TripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams, input = parseInput(params), journey = readJourney(input, params);
  const plan = journeyPlan(journey, input), editUrl = `/?${queryString(input)}`, currentHref = journeyUrl(input, journey);
  const adjustUrl = journeyUrl(input, journey, "/adjust"), next = plan.stops[0];
  const doneCount = journey.done.filter(stop => stop.id !== "connector").length;
  const leftCount = plan.stops.filter(stop => stop.category !== "connector").length;
  const skippedCount = journey.skipped.filter(id => id !== "connector").length;
  const total = doneCount + leftCount + skippedCount;
  const status = input.intentSource === "bailian" ? "AI 已理解你的偏好" : input.intentSource === "fallback" ? "已使用基础规划，仍可继续" : "基础路线规划";
  const [scene, title] = plan.title.split(" · ");
  const remainingPlan = { ...plan, stops: plan.stops.slice(1) };
  return <><Header/><main id="main-content" className="page trip-page">
    <div className="page-topline"><Link className="back-link" href={editUrl}><Icon name="back" size={17}/>重新选择偏好</Link><span className="quiet-label">今日行程</span></div>
    {params.journey && !decodeJourney(params.journey) && <p role="alert" className="applied-banner">进度链接不完整，已显示初始路线。请从原来的完整链接继续。</p>}
    <header className="trip-heading"><div><p className="eyebrow">{scene} · PERFECTDAY</p><h1>{title || scene}</h1></div><span className="planning-status"><Icon name="sparkles" size={15}/>{status}</span></header>
    <RememberTrip href={currentHref} title={plan.title} done={doneCount} left={leftCount}/>
    <div className="trip-layout">
      <section className="next-area" aria-label="当前进度与下一站">
        <div className="journey-progress"><div><strong>已完成 {doneCount} 站<span> / {total} 站</span></strong><small>{skippedCount ? `已跳过 ${skippedCount} 站 · ` : ""}{leftCount ? `还有 ${leftCount} 站，慢慢来` : "本段已结束"}</small></div><span className="progress-location"><Icon name="pin" size={14}/>{mallName(journey.current)}</span><progress aria-label="行程完成进度" max={Math.max(1, total)} value={doneCount}/></div>
        {next ? <article className="next-stop-panel"><div className="next-stop-topline"><span className="next-label"><i/>{next.category === "connector" ? "接下来换区" : "下一站"}</span><Link href={adjustUrl}>{next.time} 起 <Icon name="sliders" size={14}/></Link></div><h2>{next.name}</h2><p className="next-address"><Icon name="pin" size={14}/>{next.mall} · {next.floor}</p><div className="next-facts"><span><Icon name="clock" size={16}/>停留 {next.duration} 分</span><span><Icon name="walk" size={16}/>步行约 {next.walkMinutes} 分</span><span><Icon name="wallet" size={16}/>{next.price ? `约 ¥${next.price}/人` : "无预设消费"}</span></div>
          <div className="next-stop-actions"><a className="map-cta" href={amapUrl(next.searchKeyword || `${next.name} ${next.address}`)} target="_blank" rel="noreferrer"><Icon name="pin" size={17}/>高德地图<Icon name="external" size={14}/></a><ActionLink className="complete-cta" href={journeyUrl(input, advanceJourney(input, journey))} beforeHref={currentHref} label={next.category === "connector" ? "已到另一商场" : "这一站逛完了"}><Icon name="check" size={17}/>{next.category === "connector" ? "已到另一商场" : "这一站逛完了"}</ActionLink></div>
          <div className="next-stop-footer"><span>按预计时间与消费更新进度</span><ActionLink className="skip-action" href={journeyUrl(input, advanceJourney(input, journey, true))} beforeHref={currentHref} label={next.category === "connector" ? "不换商场了" : "跳过这一站"}/></div>
          <details className="next-details"><summary>停留建议与地点资料<Icon name="arrow" size={15}/></summary><p>{next.note}</p><small>资料查阅：{next.checkedAt} · {next.evidenceNote || "公开信息，非实时营业确认。"}</small>{next.sourceUrl && <a href={next.sourceUrl} target="_blank" rel="noreferrer">{next.sourceLabel}<Icon name="external" size={13}/></a>}</details>
        </article> : <div className="journey-finish"><span className="finish-symbol"><Icon name="sun" size={36}/></span><p className="eyebrow">今天的这一段</p><h2>{doneCount ? "这一段，告一段落。" : "先留一点自由时间。"}</h2><p>{doneCount ? `已经留下 ${doneCount} 站记录。` : "当前条件下没有可继续的地点。"}可以撤销刚才的操作，或重新安排一段行程。</p><Link href={editUrl} className="primary-button">规划新行程<Icon name="arrow" size={17}/></Link></div>}
      </section>
      <aside className="trip-summary"><div className="section-heading"><h2>剩下的时间</h2><Link href={adjustUrl} className="text-link">修改<Icon name="sliders" size={15}/></Link></div><div className="balance-grid"><div><small>还可以逛</small><strong>{formatMinutes(journey.minutes)}</strong></div><div><small>剩余预算 / 人</small><strong>¥{journey.cash}</strong></div></div><Metrics plan={plan} remaining/><p className="flexible-time"><Icon name="sun" size={16}/>还留有 {Math.max(0, journey.minutes - plan.totalMinutes)} 分钟机动时间</p>
        <div className="route-actions"><Link className="primary-button" href={adjustUrl}><Icon name="sliders"/>重排剩余行程<Icon name="arrow"/></Link><ShareTrip href={currentHref}/></div>
        <details className="trip-explanation"><summary>我的偏好与估算说明<Icon name="arrow" size={15}/></summary>{input.request && <p className="original-request">{input.request}</p>}<p>下一段从 {clockText(journey.clock)} 开始。完成一站按预计时间与消费扣减，请按实际情况修正余额；额外购物另计。</p><p>此设备会保留最近行程。复制的链接包含需求与进度，同行人打开可查看当时的安排。</p></details><Link className="text-link guide-shortcut" href="/guide">商圈资料与到店提示<Icon name="external" size={14}/></Link>
      </aside>
      <section className="itinerary" aria-labelledby="itinerary-title"><div className="section-heading"><h2 id="itinerary-title">{remainingPlan.stops.length ? "之后还去哪" : "留给自己的空闲"}</h2><span className="section-note">{remainingPlan.stops.filter(stop => stop.category !== "connector").length} 个后续停留点</span></div>
        {remainingPlan.stops.length > 0 ? <Timeline plan={remainingPlan} editUrl={editUrl} startAt={2}/> : <p className="route-tail"><Icon name="sun" size={21}/>没有更多固定安排，按自己的节奏慢慢来。</p>}
        {journey.done.length > 0 && <details className="completed-history"><summary><Icon name="check" size={17}/><span>已完成的记录 · {doneCount} 站</span><Icon name="arrow" size={15}/></summary><ol>{journey.done.map(visit => <li key={visit.id}><time>{clockText(visit.t)}</time><span>{resolveStop(visit).name}<small>原安排 {visit.d + visit.w} 分钟 · 预计 ¥{visit.p}</small></span><Icon name="check" size={15}/></li>)}</ol></details>}
        {journey.skipped.length > 0 && <details className="removed-stops"><summary>已跳过 {journey.skipped.length} 项</summary><ul>{journey.skipped.map(id => <li key={id}>{resolveStop({ id }).name}</li>)}</ul></details>}
        <p className="photo-note">时间与消费均为估算，营业与通行以现场为准。图片为 AI 氛围示意，非门店实拍。</p>
      </section>
    </div></main></>;
}
