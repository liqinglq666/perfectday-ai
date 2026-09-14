import Image from "next/image";
import Link from "next/link";
import ActionLink from "@/app/components/action-link";
import Icon from "@/app/components/ui-icon";
import { amapUrl } from "@/app/components/trip-ui";
import { advanceJourney, journeyUrl, type Journey } from "@/lib/journey";
import type { PlanInput, TripStop } from "@/types";

type Props = {
  next?: TripStop;
  input: PlanInput;
  journey: Journey;
  currentHref: string;
  adjustUrl: string;
  editUrl: string;
  doneCount: number;
};

export default function NextStopPanel({ next, input, journey, currentHref, adjustUrl, editUrl, doneCount }: Props) {
  if (!next) {
    const stateImage = doneCount ? "/images/ui/states/state-success.webp" : "/images/ui/states/state-empty.webp";
    const stateAlt = doneCount ? "行程完成后的轻松商圈拼贴插图" : "暂无后续行程时的留白路线拼贴插图";
    return <div className="journey-finish">
      <div className="journey-finish-copy">
        <span className="finish-symbol"><Icon name="sun" size={36}/></span>
        <p className="eyebrow">今天的这一段</p>
        <h2>{doneCount ? "这一段，告一段落。" : "先留一点自由时间。"}</h2>
        <p>{doneCount ? `已经留下 ${doneCount} 站记录。` : "当前条件下没有可继续的地点。"}可以撤销刚才的操作，或重新安排一段行程。</p>
        <Link href={editUrl} className="primary-button">规划新行程<Icon name="arrow" size={17}/></Link>
      </div>
      <div className="journey-finish-visual"><Image src={stateImage} alt={stateAlt} fill sizes="(max-width: 760px) calc(100vw - 80px), 260px"/></div>
    </div>;
  }

  const completeLabel = next.category === "connector" ? "已到另一商场" : "这一站逛完了";
  const skipLabel = next.category === "connector" ? "不换商场了" : "跳过这一站";

  return <article className="next-stop-panel">
    <div className="next-stop-topline">
      <span className="next-label"><i/>{next.category === "connector" ? "接下来换区" : "下一站"}</span>
      <Link href={adjustUrl}>{next.time} 起 <Icon name="sliders" size={14}/></Link>
    </div>
    <h2>{next.name}</h2>
    <p className="next-address"><Icon name="pin" size={14}/>{next.mall} · {next.floor}</p>
    <div className="next-facts">
      <span><Icon name="clock" size={16}/>停留 {next.duration} 分</span>
      <span><Icon name="walk" size={16}/>步行约 {next.walkMinutes} 分</span>
      <span><Icon name="wallet" size={16}/>{next.price ? `约 ¥${next.price}/人` : "无预设消费"}</span>
    </div>
    <div className="next-stop-actions">
      <a className="map-cta" href={amapUrl(next.searchKeyword || `${next.name} ${next.address}`)} target="_blank" rel="noreferrer">
        <Icon name="pin" size={17}/>高德地图<Icon name="external" size={14}/>
      </a>
      <ActionLink className="complete-cta" href={journeyUrl(input, advanceJourney(input, journey))} beforeHref={currentHref} label={completeLabel}>
        <Icon name="check" size={17}/>{completeLabel}
      </ActionLink>
    </div>
    <div className="next-stop-footer">
      <span>按预计时间与消费更新进度</span>
      <ActionLink className="skip-action" href={journeyUrl(input, advanceJourney(input, journey, true))} beforeHref={currentHref} label={skipLabel}/>
    </div>
    <details className="next-details">
      <summary>停留建议与地点资料<Icon name="arrow" size={15}/></summary>
      <p>{next.note}</p>
      <small>资料查阅：{next.checkedAt} · {next.evidenceNote || "公开信息，非实时营业确认。"}</small>
      {next.sourceUrl && <a href={next.sourceUrl} target="_blank" rel="noreferrer">{next.sourceLabel}<Icon name="external" size={13}/></a>}
    </details>
  </article>;
}
