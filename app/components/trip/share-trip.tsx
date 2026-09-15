"use client";

import { useState } from "react";
import Icon from "@/app/components/ui-icon";

export default function ShareTrip({ href }: { href: string }) {
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState("");

  async function copy() {
    const url = new URL(href, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("已复制，收藏链接可继续这段行程。");
      setFallback("");
    } catch {
      setFallback(url);
      setMessage("请长按或全选下方链接复制。");
    }
  }

  return <div className="share-trip">
    <button className="secondary-button" type="button" onClick={copy}><Icon name="external" size={16}/>复制行程与进度链接</button>
    <span role="status">{message}</span>
    {fallback && <input aria-label="完整行程链接" readOnly value={fallback} onFocus={event => event.target.select()}/>} 
  </div>;
}
