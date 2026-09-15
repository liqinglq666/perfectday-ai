import Icon from "@/app/components/ui-icon";
import { formatMinutes } from "@/lib/format";
import type { TripPlan } from "@/types";

export default function Metrics({ plan, remaining = false }: { plan: TripPlan; remaining?: boolean }) {
  return <dl className="metrics">
    <div><dt><Icon name="clock" size={16}/>{remaining ? "已安排" : "总时长"}</dt><dd>{formatMinutes(plan.totalMinutes)}</dd></div>
    <div><dt><Icon name="wallet" size={16}/>{remaining ? "预计花费" : "人均预计"}</dt><dd>¥{plan.totalPrice}</dd></div>
    <div><dt><Icon name="walk" size={16}/>预计步行</dt><dd>{plan.totalWalkMinutes}<small> 分钟</small></dd></div>
  </dl>;
}
