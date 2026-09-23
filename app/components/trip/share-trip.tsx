"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/app/components/ui-icon";

export default function ShareTrip({ href }: { href: string }) {
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState("");
  const [copying, setCopying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  useEffect(() => { setMessage(""); setFallback(""); }, [href]);
  useEffect(() => { if (fallback) { inputRef.current?.focus(); inputRef.current?.select(); } }, [fallback]);
  async function copy() {
    if (busyRef.current) return;
    busyRef.current = true; setCopying(true);
    const url = new URL(href, window.location.origin).href;
    try { await navigator.clipboard.writeText(url); setMessage("已复制。分享此链接，也会分享当前行程进度。"); setFallback(""); }
    catch { setFallback(url); setMessage("自动复制不可用，请复制下方已选中的完整链接。"); }
    finally { busyRef.current = false; setCopying(false); }
  }
  return <div className="share-trip">
    <button className="secondary-button" type="button" onClick={copy} disabled={copying} aria-busy={copying}><Icon name="external" size={16}/>{copying ? "正在复制…" : "复制行程与进度链接"}</button>
    <span role="status" aria-live="polite">{message}</span>
    {fallback && <input ref={inputRef} aria-label="完整行程链接" readOnly value={fallback} onFocus={event => event.target.select()}/>}
  </div>;
}
