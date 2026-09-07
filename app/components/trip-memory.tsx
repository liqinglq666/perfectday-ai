"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "./ui-icon";
import ActionLink from "./action-link";
import { LAST_TRIP_KEY, UNDO_TRIP_KEY, readSavedTrip, readTripUndo, type SavedTrip, type TripUndo } from "@/lib/trip-storage";
export function RememberTrip({ href, title, done, left }: Omit<SavedTrip, "v" | "savedAt">) {
  const [undo, setUndo] = useState<TripUndo | null>(null);
  useEffect(() => {
    try { localStorage.setItem(LAST_TRIP_KEY, JSON.stringify({ v: 1, href, title, done, left, savedAt: Date.now() })); } catch { /* URL sharing still works. */ }
    try { setUndo(readTripUndo(sessionStorage.getItem(UNDO_TRIP_KEY), href)); } catch { setUndo(null); }
  }, [href, title, done, left]);
  return undo ? <div className="undo-notice" role="status"><span><Icon name="check" size={16}/>{undo.label === "跳过这一站" ? "已跳过这一站" : undo.label === "不换商场了" ? "已保留当前商场的安排" : "已更新行程"}</span><ActionLink href={undo.from} label="撤销上一步" className="text-link">撤销上一步<Icon name="back" size={15}/></ActionLink></div> : null;
}
export function RecentTrip() {
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  useEffect(() => { try { setTrip(readSavedTrip(localStorage.getItem(LAST_TRIP_KEY))); } catch { /* Storage is optional. */ } }, []);
  if (!trip) return null;
  return <aside className="recent-trip"><span className="recent-symbol"><Icon name="clock" size={22}/></span><div><small>保存在此设备</small><h2>{trip.left ? "接着逛上次的行程" : "回看上次的行程"}</h2><p>{trip.title} · 已完成 {trip.done} 站{trip.left ? `，还有 ${trip.left} 站` : ""}</p></div><Link href={trip.href} className="secondary-button">{trip.left ? "继续行程" : "查看记录"}<Icon name="arrow" size={17}/></Link></aside>;
}
