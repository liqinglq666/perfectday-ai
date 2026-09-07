"use client";
import { useState } from "react";
import type { Place } from "@/types";
import Icon from "./ui-icon";
import { amapUrl } from "./trip-ui";
type Entry = Pick<Place, "id" | "name" | "mall" | "floor" | "category" | "sourceLabel" | "sourceUrl" | "checkedAt" | "evidenceNote" | "searchKeyword">;
const categories: Record<string, [string, string]> = { culture: ["阅读", "book"], coffee: ["咖啡", "coffee"], food: ["用餐", "food"], family: ["亲子", "family"], shopping: ["逛店", "wallet"], activity: ["互动", "users"] };
export default function PlaceDirectory({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState(""), [mall, setMall] = useState("all");
  const found = entries.filter(place => (mall === "all" || (place.mall === "假日广场" ? "holiday" : "golden") === mall) && `${place.name} ${place.floor} ${categories[place.category]?.[0] || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="directory-browser"><div className="directory-tools"><label className="directory-search"><Icon name="search" size={19}/><span className="sr-only">搜索商圈地点</span><input type="search" placeholder="搜门店，比如博雅、宜得利" value={query} onChange={event => setQuery(event.target.value)}/></label><div className="mall-filters" aria-label="按商场筛选">{[["all", "全部"], ["holiday", "假日广场"], ["golden", "石岐万象汇"]].map(([value, label]) => <button key={value} type="button" aria-pressed={mall === value} onClick={() => setMall(value)}>{label}</button>)}</div></div><p className="directory-count" aria-live="polite">找到 {found.length} 个地点 · 资料查阅 2026-09-07</p>
    <div className="place-directory">{found.map(place => <article className="directory-card" key={place.id}><div className="directory-card-head"><span className={`category-stamp category-${place.category}`}><Icon name={categories[place.category]?.[1] || "pin"} size={22}/></span><div><small>{place.mall}</small><h3>{place.name}</h3></div></div><p className="directory-floor"><Icon name="pin" size={14}/>{place.floor}</p><div className="directory-card-actions"><a href={amapUrl(place.searchKeyword || `${place.name} 中山`)} target="_blank" rel="noreferrer">查看地图<Icon name="external" size={14}/></a><span>{categories[place.category]?.[0]}</span></div><details><summary>公开资料与到店提醒<Icon name="arrow" size={14}/></summary><p>{place.evidenceNote || "公开资料可支持地址或品牌信息，营业与消费请出发前确认。"}</p><a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.sourceLabel}<Icon name="external" size={13}/></a></details></article>)}</div>
    {!found.length && <div className="empty-state"><Icon name="search" size={30}/><h3>还没找到这个地点</h3><p>试试品牌简称，或切换到全部商场。</p><button type="button" className="secondary-button" onClick={() => { setQuery(""); setMall("all"); }}>查看全部地点</button></div>}
  </div>;
}
