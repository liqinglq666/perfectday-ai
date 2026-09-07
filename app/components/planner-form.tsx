"use client";
import { useState } from "react";
import { generateTrip } from "@/app/actions";
import SubmitButton from "@/app/submit-button";
import type { PlanInput, Scene, Budget, Walking } from "@/types";
import Icon from "./ui-icon";
const scenes = [["date", "heart", "约会"], ["friends", "users", "朋友"], ["family", "family", "家人"], ["solo", "coffee", "独处"]] as const;
const examples = [
  { label: "陪爸妈慢逛", request: "陪爸妈逛两小时，想逛宜得利，不喝咖啡，尽量室内", scene: "family", duration: 120, budget: "100", walking: "low" },
  { label: "朋友聚一聚", request: "和朋友逛书店、喝咖啡，再吃晚饭", scene: "friends", duration: 240, budget: "300", walking: "normal" },
  { label: "雨天遛娃", request: "带孩子在室内玩，安排亲子乐园，少走路", scene: "family", duration: 180, budget: "300", walking: "low" },
] as const;
function homeScene(scene: Scene): Scene {
  return scene === "parents" || scene === "rain" ? "family" : scene;
}
export default function PlannerForm({ initial }: { initial: PlanInput }) {
  const [request, setRequest] = useState(initial.request), [scene, setScene] = useState<Scene>(homeScene(initial.scene));
  const [duration, setDuration] = useState(initial.duration), [budget, setBudget] = useState<Budget>(initial.budget), [walking, setWalking] = useState<Walking>(initial.walking);
  const [example, setExample] = useState("");
  const durations = [...new Set([90, 120, 180, 240, 360, 480, initial.duration])].sort((a, b) => a - b);
  return <form action={generateTrip} className="planner-panel" id="planner">
    <div className="panel-heading"><span className="mini-mark"><Icon name="sparkles"/></span><div><h2>今天，按你的节奏来</h2><p>选好时间和偏好，就可以出发。</p></div></div>
    <div className="request-field"><label htmlFor="request">今天想怎么玩？<span>选填</span></label><textarea id="request" name="request" value={request} onChange={event => { setRequest(event.target.value); setExample(""); }} maxLength={600} rows={3} placeholder="比如：带爸妈逛两小时，想逛书店，不喝咖啡，少走路" aria-describedby="request-help"/><div className="request-help"><p id="request-help">也可以直接选下方偏好，文字描述优先。</p><small>{request.length}/600</small></div></div>
    <div className="example-chips" aria-label="试填一种出行想法">{examples.map(item => <button key={item.label} type="button" aria-pressed={example === item.label} onClick={() => { setRequest(item.request); setScene(item.scene); setDuration(item.duration); setBudget(item.budget); setWalking(item.walking); setExample(item.label); }}><Icon name="sparkles" size={13}/>{item.label}</button>)}</div>
    <fieldset><legend><span className="step-number">01</span>和谁一起？</legend><div className="scene-grid">{scenes.map(([value, icon, label]) => <label className="scene-option" key={value}><input type="radio" name="scene" value={value} checked={scene === value} onChange={() => { setScene(value); setExample(""); }}/><span><Icon name={icon}/><strong>{label}</strong></span></label>)}</div></fieldset>
    <fieldset><legend><span className="step-number">02</span>留多少时间和预算？</legend><div className="preferences">
      <label><span><Icon name="clock" size={16}/>空闲时间</span><select name="duration" value={duration} onChange={event => setDuration(Number(event.target.value))}>{durations.map(value => <option key={value} value={value}>{value % 60 === 0 ? `${value / 60} 小时` : `${value} 分钟`}</option>)}</select></label>
      <label><span><Icon name="wallet" size={16}/>人均预算</span><select name="budget" value={budget} onChange={event => setBudget(event.target.value as Budget)}><option value="100">¥100 内</option><option value="300">¥300 内</option><option value="500">¥500 内</option><option value="plus">¥800 内</option></select></label>
      <label><span><Icon name="walk" size={16}/>步行偏好</span><select name="walking" value={walking} onChange={event => setWalking(event.target.value as Walking)}><option value="low">少走一点</option><option value="normal">正常步行</option></select></label>
    </div></fieldset>
    <SubmitButton/><div className="form-reassurance"><Icon name="check" size={14}/>途中可以改，不用一次想好所有安排</div>
  </form>;
}
