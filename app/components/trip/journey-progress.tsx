import Icon from "@/app/components/ui-icon";
import { mallName, type Journey } from "@/lib/journey";

type Props = {
  journey: Journey;
  doneCount: number;
  leftCount: number;
  skippedCount: number;
  total: number;
};

export default function JourneyProgress({ journey, doneCount, leftCount, skippedCount, total }: Props) {
  return <div className="journey-progress">
    <div>
      <strong>已完成 {doneCount} 站<span> / {total} 站</span></strong>
      <small>{skippedCount ? `已跳过 ${skippedCount} 站 · ` : ""}{leftCount ? `还有 ${leftCount} 站，慢慢来` : "本段已结束"}</small>
    </div>
    <span className="progress-location"><Icon name="pin" size={14}/>{mallName(journey.current)}</span>
    <progress aria-label="行程完成进度" max={Math.max(1, total)} value={doneCount + skippedCount}/>
  </div>;
}
