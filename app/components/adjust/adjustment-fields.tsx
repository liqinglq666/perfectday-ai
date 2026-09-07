import type { AdjustmentFields } from "@/lib/adjustment-form";

type Props = {
  values: AdjustmentFields;
  onChange: (key: keyof AdjustmentFields, value: string) => void;
  onReset: () => void;
};

export default function AdjustmentFieldsPanel({ values, onChange, onReset }: Props) {
  return <>
    <div className="section-heading">
      <h2><span className="step-number">01</span>现在的时间与预算</h2>
      <button className="text-link" type="button" onClick={onReset}>还原本次修改</button>
    </div>
    <div className="remaining-fields">
      <label>还能逛多久（分钟）
        <input type="number" inputMode="numeric" name="left" min="0" max="480" step="1" required value={values.left} onChange={event => onChange("left", event.target.value)}/>
      </label>
      <label>剩余预算（元 / 人）
        <input type="number" inputMode="numeric" name="cash" min="0" max="10000" step="1" required value={values.cash} onChange={event => onChange("cash", event.target.value)}/>
      </label>
      <label>下一段出发时间
        <input type="time" name="from" required value={values.from} onInput={event => onChange("from", event.currentTarget.value)} onChange={event => onChange("from", event.target.value)}/>
      </label>
      <label>现在所在商场
        <select name="current" value={values.current} onChange={event => onChange("current", event.target.value)}>
          <option value="">尚未开始</option>
          <option value="holiday">假日广场</option>
          <option value="golden">石岐万象汇</option>
        </select>
      </label>
    </div>
    <div className="time-presets">
      <span>还剩</span>
      {[30, 60, 120].map(minutes => <button type="button" key={minutes} aria-pressed={values.left === String(minutes)} onClick={() => onChange("left", String(minutes))}>{minutes} 分钟</button>)}
    </div>
  </>;
}
