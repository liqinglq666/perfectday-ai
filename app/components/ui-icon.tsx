import type { ReactNode } from "react";
const paths: Record<string, ReactNode> = {
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  back: <path d="M20 12H4m6-6-6 6 6 6"/>,
  external: <><path d="M14 4h6v6m0-6-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></>,
  heart: <path d="M12 20S3 14.5 3 8.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 11.5-9 11.5Z"/>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m2-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v2"/></>,
  family: <><circle cx="8" cy="6" r="3"/><circle cx="17" cy="11" r="2"/><path d="M2 21v-4a6 6 0 0 1 12 0v4m0-1v-2a3 3 0 0 1 6 0v3"/></>,
  coffee: <><path d="M4 8h13v6a6.5 6.5 0 0 1-13 0Zm13 1h2a3 3 0 0 1 0 6h-2M7 2v2m5-2v2M3 22h16"/></>,
  rain: <><path d="M3 12a9 9 0 0 1 18 0H3Zm9 0v7a2 2 0 0 0 4 0M12 2v1"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5l13-3v3m5 6h-5v5h5m-3-2.5h.01"/></>,
  walk: <><circle cx="14" cy="4" r="2"/><path d="m8 22 3-7m6 7-3-9 1-6-4 2-2 4H5m10-5 3 5h3M11 15l-2-3"/></>,
  sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM21 2v4m-2-2h4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  sliders: <><path d="M4 7h4m4 0h8M4 17h8m4 0h4"/><circle cx="10" cy="7" r="2"/><circle cx="14" cy="17" r="2"/></>,
  book: <><path d="M12 5C9 3 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/></>,
  queue: <><circle cx="12" cy="12" r="9"/><path d="M7 10h10M7 14h7"/></>,
  food: <><path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v19m11 0V3c-4 3-4 10 0 10"/></>
};
export default function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.pin}</svg>;
}
