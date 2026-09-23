"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { generateTrip } from "@/app/actions";
import Icon from "@/app/components/ui-icon";
import SubmitButton from "@/app/components/home/submit-button";
import type { Budget, PlanInput, Scene, Walking } from "@/types";

const SCENES = [["date", "heart", "约会"], ["friends", "users", "朋友"], ["family", "family", "家人"], ["solo", "coffee", "独处"]] as const;
const EXAMPLES = [
  { label: "陪爸妈慢逛", icon: "family", request: "陪爸妈逛两小时，想逛宜得利，不喝咖啡，尽量室内", scene: "parents", duration: 120, budget: "100", walking: "low" },
  { label: "朋友聚一聚", icon: "coffee", request: "和朋友逛书店、喝咖啡，再吃晚饭。", scene: "friends", duration: 240, budget: "300", walking: "low" },
  { label: "雨天遛娃", icon: "rain", request: "带孩子在室内玩，安排亲子乐园，少走路", scene: "rain", duration: 180, budget: "300", walking: "low" }
] as const;
const homeScene = (scene: Scene): Scene => scene === "parents" || scene === "rain" ? "family" : scene;
const durationLabel = (value: number) => value % 60 === 0 ? `${value / 60} 小时` : `${value} 分钟`;

function PlannerFields({ initial }: { initial: PlanInput }) {
  const { pending } = useFormStatus();
  const [request, setRequest] = useState(initial.request);
  const [scene, setScene] = useState<Scene>(initial.scene);
  const [duration, setDuration] = useState(initial.duration);
  const [budget, setBudget] = useState<Budget>(initial.budget);
  const [walking, setWalking] = useState<Walking>(initial.walking);
  const [example, setExample] = useState("");
  const [notice, setNotice] = useState("");
  const durations = [...new Set([90, 120, 180, 240, 360, 480, initial.duration])].sort((a, b) => a - b);
  const visibleScene = homeScene(scene);
  function edited() { setExample(""); setNotice(""); }
  function reset() {
    setRequest(initial.request); setScene(initial.scene); setDuration(initial.duration);
    setBudget(initial.budget); setWalking(initial.walking); setExample(""); setNotice("已恢复初始偏好。");
  }
  return <div className="planner-fields" aria-busy={pending}>
    <input type="hidden" name="scene" value={scene}/>
    <div className="panel-heading">
      <span className="mini-mark"><Icon name="sparkles"/></span>
      <div><p className="panel-kicker">LET’S MAKE A DAY OF IT</p><h2 id="planner-title">今天，想怎么逛？</h2><p>一句话，或者几个选择，就能开始。</p></div>
      <button type="button" className="reset-planner" onClick={reset} disabled={pending} aria-label="重置规划偏好">重置</button>
    </div>
    <div className="request-field">
      <label htmlFor="request"><span className="field-number">01</span><strong>说说你的想法</strong><em>选填</em></label>
      <textarea id="request" name="request" value={request} disabled={pending} maxLength={600} rows={3}
        onChange={event => { setRequest(event.target.value); edited(); }}
        onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.nativeEvent.isComposing && !pending) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
        placeholder="比如：陪爸妈逛两小时，想逛宜得利，不喝咖啡，尽量室内"
        aria-describedby="request-help"/>
      <div className="request-help"><p id="request-help">不填也没关系，直接选择下方偏好。</p><small aria-label={`已输入 ${request.length} 字，上限 600 字`}>{request.length}/600</small></div>
    </div>
    <div className="example-chips" role="group" aria-label="试填一种出行想法">
      {EXAMPLES.map(item => <button key={item.label} type="button" disabled={pending} aria-pressed={example === item.label} onClick={() => {
        setRequest(item.request); setScene(item.scene); setDuration(item.duration); setBudget(item.budget); setWalking(item.walking);
        setExample(item.label); setNotice(`已填入“${item.label}”，可以继续修改。`);
      }}><Icon name={item.icon} size={15}/>{item.label}</button>)}
    </div>
    <fieldset disabled={pending}>
      <legend><span className="step-number">02</span>和谁一起逛？</legend>
      <div className="scene-grid">{SCENES.map(([value, icon, label]) => <label className="scene-option" key={value}>
        <input type="radio" name="scene-choice" value={value} checked={visibleScene === value} onChange={() => { setScene(value); edited(); }}/>
        <span><Icon name={icon}/><strong>{label}</strong><Icon name="check" size={12} className="selection-check"/></span>
      </label>)}</div>
    </fieldset>
    <fieldset disabled={pending}>
      <legend><span className="step-number">03</span>按你的节奏来</legend>
      <div className="preferences">
        <label><span><Icon name="clock" size={16}/>空闲时间</span><select name="duration" value={duration} onChange={event => { setDuration(Number(event.target.value)); edited(); }}>{durations.map(value => <option key={value} value={value}>{durationLabel(value)}</option>)}</select></label>
        <label><span><Icon name="wallet" size={16}/>人均预算</span><select name="budget" value={budget} onChange={event => { setBudget(event.target.value as Budget); edited(); }}><option value="100">¥100 内</option><option value="300">¥300 内</option><option value="500">¥500 内</option><option value="plus">¥800 内</option></select></label>
        <label><span><Icon name="walk" size={16}/>步行偏好</span><select name="walking" value={walking} onChange={event => { setWalking(event.target.value as Walking); edited(); }}><option value="low">少走一点</option><option value="normal">正常步行</option></select></label>
      </div>
    </fieldset>
    <div className="plan-recap"><Icon name="sliders" size={15}/><p>偏好参考：{durationLabel(duration)} · 人均 ¥{budget === "plus" ? "800" : budget} 内 · {walking === "low" ? "少走一点" : "正常步行"}{request.trim() && <small>与文字有冲突时，以文字描述优先。</small>}</p></div>
    <span className="sr-only" role="status" aria-live="polite">{notice}</span>
    <SubmitButton/>
    <div className="form-reassurance"><Icon name="check" size={14}/>不用一次决定，途中随时调整</div>
  </div>;
}
export default function PlannerForm({ initial }: { initial: PlanInput }) {
  return <form action={generateTrip} className="planner-panel v4-planner" id="planner" aria-labelledby="planner-title" tabIndex={-1}><PlannerFields initial={initial}/></form>;
}
