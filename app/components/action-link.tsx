"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { UNDO_TRIP_KEY } from "@/lib/trip-storage";
export default function ActionLink({ href, beforeHref, label, children, className = "" }: { href: string; beforeHref?: string; label: string; children?: ReactNode; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Link href={href} prefetch={false} scroll={false} className={className} aria-disabled={pending} aria-busy={pending} onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pending) return;
    if (beforeHref) try { sessionStorage.setItem(UNDO_TRIP_KEY, JSON.stringify({ from: beforeHref, to: href, label })); } catch { /* Navigation remains available when storage is blocked. */ }
    startTransition(() => router.push(href, { scroll: false }));
  }}>{pending ? <><span className="spinner" aria-hidden="true"/>正在更新…</> : children || label}</Link>;
}
