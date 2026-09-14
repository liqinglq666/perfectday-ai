"use client";
import { useFormStatus } from "react-dom";
import Icon from "./components/ui-icon";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return <>
    <button className="primary-button main-cta" type="submit" disabled={pending} aria-busy={pending}>
      <span>{pending ? "正在理解需求并规划…" : "开始生成今天的路线"}</span>
      {pending ? <span className="spinner" aria-hidden="true"/> : <Icon name="arrow"/>}
    </button>
    <span className="sr-only" role="status" aria-live="polite">{pending ? "正在规划，请稍候。" : ""}</span>
  </>;
}
