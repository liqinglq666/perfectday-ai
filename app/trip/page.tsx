import Link from "next/link";
import Header from "@/app/components/header";
import Icon from "@/app/components/ui-icon";
import { RememberTrip } from "@/app/components/trip-memory";
import JourneyProgress from "@/app/components/trip/journey-progress";
import NextStopPanel from "@/app/components/trip/next-stop-panel";
import TripHistory from "@/app/components/trip/trip-history";
import TripSummary from "@/app/components/trip/trip-summary";
import { closedPlaceNotices } from "@/lib/closed-places";
import { parseInput, queryString } from "@/lib/planner";
import { decodeJourney, journeyPlan, journeyUrl, readJourney } from "@/lib/journey";

export default async function TripPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const input = parseInput(params);
  const journey = readJourney(input, params);
  const plan = journeyPlan(journey, input);
  const editUrl = `/?${queryString(input)}`;
  const currentHref = journeyUrl(input, journey);
  const adjustUrl = journeyUrl(input, journey, "/adjust");
  const next = plan.stops[0];
  const closedNotices = closedPlaceNotices(input.request);
  const doneCount = journey.done.filter(stop => stop.id !== "connector").length;
  const leftCount = plan.stops.filter(stop => stop.category !== "connector").length;
  const skippedCount = journey.skipped.filter(id => id !== "connector").length;
  const total = doneCount + leftCount + skippedCount;
  const status = input.intentSource === "bailian"
    ? "AI 已理解你的偏好"
    : input.intentSource === "fallback"
      ? "已使用基础规划，仍可继续"
      : "基础路线规划";
  const [scene, title] = plan.title.split(" · ");
  const remainingPlan = { ...plan, stops: plan.stops.slice(1) };

  return <>
    <Header/>
    <main id="main-content" className="page trip-page">
      <div className="page-topline">
        <Link className="back-link" href={editUrl}><Icon name="back" size={17}/>重新选择偏好</Link>
        <span className="quiet-label">今日行程</span>
      </div>

      {params.journey && !decodeJourney(params.journey) && <p role="alert" className="applied-banner">进度链接不完整，已显示初始路线。请从原来的完整链接继续。</p>}
      {closedNotices.map(notice => <p role="status" className="applied-banner" key={notice.id}>
        <strong>{notice.name} 已闭店。</strong> {notice.closureLabel}。{notice.alternatives.length ? `可考虑：${notice.alternatives.map(item => item.name).join("、")}。` : "当前地点库暂没有合适替代项。"} <a href={notice.sourceUrl} target="_blank" rel="noreferrer">{notice.sourceLabel}<Icon name="external" size={13}/></a>
      </p>)}

      <header className="trip-heading">
        <div><p className="eyebrow">{scene} · PERFECTDAY</p><h1>{title || scene}</h1></div>
        <span className="planning-status"><Icon name="sparkles" size={15}/>{status}</span>
      </header>

      <RememberTrip href={currentHref} title={plan.title} done={doneCount} left={leftCount}/>

      <div className="trip-layout">
        <section className="next-area" aria-label="当前进度与下一站">
          <JourneyProgress journey={journey} doneCount={doneCount} leftCount={leftCount} skippedCount={skippedCount} total={total}/>
          <NextStopPanel
            next={next}
            input={input}
            journey={journey}
            currentHref={currentHref}
            adjustUrl={adjustUrl}
            editUrl={editUrl}
            doneCount={doneCount}
          />
        </section>

        <TripSummary journey={journey} plan={plan} input={input} adjustUrl={adjustUrl} currentHref={currentHref}/>
        <TripHistory journey={journey} remainingPlan={remainingPlan} editUrl={editUrl} doneCount={doneCount}/>
      </div>
    </main>
  </>;
}
