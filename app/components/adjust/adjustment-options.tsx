import Icon from "@/app/components/ui-icon";
import type { AdjustmentChange } from "@/types";

const choices = [
  ["rain", "rain", "下雨了", "留在一个商场的室内"],
  ["walk", "walk", "想少走路", "优先留在当前商场"],
  ["budget", "wallet", "再省一点", "减少一项付费安排"],
  ["queue", "queue", "餐厅排队", "优先换同商场餐厅"]
] as const;

type Props = {
  changes: AdjustmentChange[];
  valid: boolean;
  onToggle: (value: AdjustmentChange, checked: boolean) => void;
};

export default function AdjustmentOptions({ changes, valid, onToggle }: Props) {
  return <>
    <fieldset>
      <legend><span className="step-number">02</span>途中发生了什么？<span className="optional-label">可多选</span></legend>
      <div className="change-grid">
        {choices.map(([value, icon, label, hint]) => <label className="change-option" key={value}>
          <input type="checkbox" name="changes" value={value} checked={changes.includes(value)} onChange={event => onToggle(value, event.target.checked)}/>
          <Icon name={icon} size={23}/>
          <span><strong>{label}</strong><small>{hint}</small></span>
        </label>)}
      </div>
    </fieldset>
    {!valid && <p className="field-error" role="alert">请填写0–480分钟、0–10000元，以及有效的出发时间。</p>}
    <p className="selection-hint"><Icon name="check" size={14}/>条件变化后，预览会即时更新。</p>
    <button type="submit" className="secondary-button preview-jump" disabled={!valid}>查看调整结果<Icon name="arrow" size={17}/></button>
    <details className="trip-explanation">
      <summary>预算、位置与排队说明<Icon name="arrow" size={15}/></summary>
      <p>手动记录位置，不自动定位。时间含步行；余额应按实际消费更新，额外购物另计。餐厅备选不代表实时空位。</p>
    </details>
  </>;
}
