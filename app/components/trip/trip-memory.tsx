"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ActionLink from "@/app/components/action-link";
import Icon from "@/app/components/ui-icon";
import {
  LAST_TRIP_KEY,
  UNDO_TRIP_KEY,
  readSavedTrip,
  readTripUndo,
  type SavedTrip,
  type TripUndo
} from "@/lib/trip-storage";

export function RememberTrip({ href, title, done, left }: Omit<SavedTrip, "v" | "savedAt">) {
  const [undo, setUndo] = useState<TripUndo | null>(null);
  const consumedHref = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LAST_TRIP_KEY, JSON.stringify({ v: 1, href, title, done, left, savedAt: Date.now() }));
    } catch {
      // URL sharing still works when storage is unavailable.
    }

    // Read once per destination, including same-page navigation. The ref also
    // prevents StrictMode's repeated effect from consuming the record twice.
    if (consumedHref.current === href) return;
    consumedHref.current = href;

    try {
      const nextUndo = readTripUndo(sessionStorage.getItem(UNDO_TRIP_KEY), href);
      setUndo(nextUndo);
      if (nextUndo) sessionStorage.removeItem(UNDO_TRIP_KEY);
    } catch {
      setUndo(null);
    }
  }, [href, title, done, left]);

  if (!undo || undo.to !== href) return null;

  const message = undo.label === "跳过这一站"
    ? "已跳过这一站"
    : undo.label === "不换商场了"
      ? "已保留当前商场的安排"
      : "已更新行程";

  return <div className="undo-notice" role="status">
    <span><Icon name="check" size={16}/>{message}</span>
    <ActionLink href={undo.from} label="撤销上一步" className="text-link">撤销上一步<Icon name="back" size={15}/></ActionLink>
  </div>;
}

function useSavedTrip() {
  const [trip, setTrip] = useState<SavedTrip | null>(null);

  useEffect(() => {
    try {
      setTrip(readSavedTrip(localStorage.getItem(LAST_TRIP_KEY)));
    } catch {
      // Storage is optional.
    }
  }, []);

  return trip;
}

export function RecentTrip() {
  const trip = useSavedTrip();
  if (!trip) return null;

  return <aside className="recent-trip">
    <span className="recent-symbol"><Icon name="clock" size={22}/></span>
    <div>
      <small>保存在此设备</small>
      <h2>{trip.left ? "接着逛上次的行程" : "回看上次的行程"}</h2>
      <p>{trip.title} · 已完成 {trip.done} 站{trip.left ? `，还有 ${trip.left} 站` : ""}</p>
    </div>
    <Link href={trip.href} className="secondary-button">{trip.left ? "继续行程" : "查看记录"}<Icon name="arrow" size={17}/></Link>
  </aside>;
}

export function RecentTripLink() {
  const trip = useSavedTrip();
  if (!trip) return null;

  return <div className="recent-trip-link">
    <Link href={trip.href} className="text-link"><Icon name="clock" size={14}/>{trip.left ? "继续上次行程" : "查看上次行程"}<Icon name="arrow" size={15}/></Link>
  </div>;
}
