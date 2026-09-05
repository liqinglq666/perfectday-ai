"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button main-cta" type="submit" disabled={pending} aria-disabled={pending}>
      <span role="status" aria-live="polite">{pending ? "正在理解需求并规划…" : "生成行程"}</span>
      <span aria-hidden="true">{pending ? "…" : "→"}</span>
    </button>
  );
}
