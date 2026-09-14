"use client";
import { useState } from "react";
import { generateTrip } from "@/app/actions";
import SubmitButton from "@/app/submit-button";
import type { PlanInput, Scene, Budget, Walking } from "@/types";
import Icon from "./ui-icon";
const scenes = [["date", "heart", "约会"], ["friends", "users", "朋友"], ["family", "family", "家人"], ["solo", "coffee", "独处"]] as const;
const examples = [
  { label: "陪爸妈慢逛", request: "陪爸妈逛两小时，想逛宜得利，不喝咖啡，尽量室内", scene: "parents", duration: 120, budget: "100", walking: "low" },
  { label: "朋友聚一聚", request: "和朋友逛书店、喝咖啡，再吃晚饭。", scene: "friends", duration: 240, budget: "300", walking: "low" },
  { label: "雨天遛娃", request: "带孩子在室内玩，安排亲子乐园，少走路", scene: "rain", duration: 180, budget: "300", walking: "low" },
] as const;
function homeScene(scene: Scene): Scene {
  return scene === "parents" || scene === "rain" ? "family" : scene;
}
export default function PlannerForm({ initial }: { initial: PlanInput }) {
  const [request, setRequest] = useState(initial.request), [scene, setScene] = useState<Scene>(initial.scene);
  const [duration, setDuration] = useState(initial.duration), [budget, setBudget] = useState<Budget>(initial.budget), [walking, setWalking] = useState<Walking>(initial.walking);
  const [example, setExample] = useState("");
  const durations = [...new Set([90, 120, 180, 240, 360, 480, initial.duration])].sort((a, b) => a - b);
  const visibleScene = homeScene(scene);
  return <form action={generateTrip} className="planner-panel v4-planner" id="planner">
    <input type="hidden" name="scene" value={scene}/>
    <div className="panel-heading"><span className="mini-mark"><Icon name="sparkles"/></span><div><p className="panel-kicker">TODAY'S PERFECT DAY</p><h2>今天，想怎么逛？</h2><p>说出同行人、时间和偏好，先给你一条刚好的路线。</p></div></div>
    <div className="request-field"><label htmlFor="request"><span className="field-number">01</span><strong>先简单说说你的想法</strong><em>选填</em></label><textarea id="request" name="request" value={request} onChange={event => { setRequest(event.target.value); setExample(""); }} maxLength={600} rows={3} placeholder="比如：陪爸妈逛两小时，想逛宜得利，不喝咖啡，尽量室内" aria-describedby="request-help"/><div className="request-help"><p id="request-help">也可以直接选下方偏好，文字描述优先。</p><small>{request.length}/600</small></div></div>
    <div className="example-chips" aria-label="试填一种出行想法">{examples.map(item => <button key={item.label} type="button" aria-pressed={example === item.label} onClick={() => { setRequest(item.request); setScene(item.scene); setDuration(item.duration); setBudget(item.budget); setWalking(item.walking); setExample(item.label); }}><Icon name="sparkles" size={13}/>{item.label}</button>)}</div>
    <fieldset><legend><span className="step-number">02</span>和谁一起逛？</legend><div className="scene-grid">{scenes.map(([value, icon, label]) => <label className="scene-option" key={value}><input type="radio" name="scene-choice" value={value} checked={visibleScene === value} onChange={() => { setScene(value); setExample(""); }}/><span><Icon name={icon}/><strong>{label}</strong></span></label>)}</div></fieldset>
    <fieldset><legend><span className="step-number">03</span>时间、预算和步行偏好？</legend><div className="preferences">
      <label><span><Icon name="clock" size={16}/>空闲时间</span><select name="duration" value={duration} onChange={event => setDuration(Number(event.target.value))}>{durations.map(value => <option key={value} value={value}>{value % 60 === 0 ? `${value / 60} 小时` : `${value} 分钟`}</option>)}</select></label>
      <label><span><Icon name="wallet" size={16}/>人均预算</span><select name="budget" value={budget} onChange={event => setBudget(event.target.value as Budget)}><option value="100">¥100 内</option><option value="300">¥300 内</option><option value="500">¥500 内</option><option value="plus">¥800 内</option></select></label>
      <label><span><Icon name="walk" size={16}/>步行偏好</span><select name="walking" value={walking} onChange={event => setWalking(event.target.value as Walking)}><option value="low">少走一点</option><option value="normal">正常步行</option></select></label>
    </div></fieldset>
    <SubmitButton/><div className="form-reassurance"><Icon name="check" size={14}/>途中变了，也只调整还没发生的部分</div>
  </form>;
}
