import Link from "next/link";
import Icon from "@/app/components/ui-icon";
import Metrics from "@/app/components/trip/metrics";
import ShareTrip from "@/app/components/trip/share-trip";
import { formatMinutes } from "@/lib/format";
import { clockText, type Journey } from "@/lib/journey";
import type { PlanInput, TripPlan } from "@/types";

type Props = {
  journey: Journey;
  plan: TripPlan;
  input: PlanInput;
  adjustUrl: string;
  currentHref: string;
};

export default function TripSummary({ journey, plan, input, adjustUrl, currentHref }: Props) {
  return <aside className="trip-summary">
    <div className="section-heading">
      <h2>剩下的时间</h2>
      <Link href={adjustUrl} className="text-link">修改<Icon name="sliders" size={15}/></Link>
    </div>
    <div className="balance-grid">
      <div><small>还可以逛</small><strong>{formatMinutes(journey.minutes)}</strong></div>
      <div><small>剩余预算 / 人</small><strong>¥{journey.cash}</strong></div>
    </div>
    <Metrics plan={plan} remaining/>
    <p className="flexible-time"><Icon name="sun" size={16}/>还留有 {Math.max(0, journey.minutes - plan.totalMinutes)} 分钟机动时间</p>
    <div className="route-actions">
      <Link className="primary-button" href={adjustUrl}><Icon name="sliders"/>重排剩余行程<Icon name="arrow"/></Link>
      <ShareTrip href={currentHref}/>
    </div>
    <details className="trip-explanation">
      <summary>我的偏好与估算说明<Icon name="arrow" size={15}/></summary>
      {input.request && <p className="original-request">{input.request}</p>}
      <p>下一段从 {clockText(journey.clock)} 开始。完成一站按预计时间与消费扣减，请按实际情况修正余额；额外购物另计。</p>
      <p>此设备会保留最近行程。复制的链接包含需求与进度，同行人打开可查看当时的安排。</p>
    </details>
    <Link className="text-link guide-shortcut" href="/guide">商圈资料与到店提示<Icon name="external" size={14}/></Link>
  </aside>;
}
