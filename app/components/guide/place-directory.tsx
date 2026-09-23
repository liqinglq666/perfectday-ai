"use client";

import { useRef, useState } from "react";
import Icon from "@/app/components/ui-icon";
import { amapUrl } from "@/lib/maps";
import type { Place, PlaceCategory } from "@/types";

type Entry = Pick<Place, "id" | "name" | "mall" | "floor" | "category" | "sourceLabel" | "sourceUrl" | "checkedAt" | "evidenceNote" | "searchKeyword">;
const CATEGORY_META: Partial<Record<PlaceCategory, [string, string]>> = {
  culture: ["阅读", "book"], coffee: ["咖啡", "coffee"], dessert: ["甜品", "coffee"], food: ["用餐", "food"], family: ["亲子", "family"], shopping: ["逛店", "wallet"], activity: ["互动", "users"]
};
const MALL_FILTERS = [["all", "全部商场"], ["holiday", "假日广场"], ["golden", "石岐万象汇"]] as const;
const mallKey = (mall: string) => mall === "假日广场" ? "holiday" : "golden";

export default function PlaceDirectory({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [mall, setMall] = useState("all");
  const [category, setCategory] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const categories = Object.entries(CATEGORY_META).filter(([key]) => entries.some(place => place.category === key));
  const found = entries.filter(place => (mall === "all" || mallKey(place.mall) === mall)
    && (category === "all" || place.category === category)
    && `${place.name} ${place.mall} ${place.floor} ${CATEGORY_META[place.category]?.[0] || ""} ${place.searchKeyword || ""}`.toLocaleLowerCase().includes(normalizedQuery));
  const filtered = !!query || mall !== "all" || category !== "all";
  function clearFilters() { setQuery(""); setMall("all"); setCategory("all"); searchRef.current?.focus(); }
  return <div className="directory-browser">
    <div className="directory-tools">
      <div className="directory-search">
        <Icon name="search" size={19}/>
        <label className="sr-only" htmlFor="place-search">搜索商圈地点</label>
        <input ref={searchRef} id="place-search" type="search" placeholder="搜索店名、楼层或想做的事" value={query} onChange={event => setQuery(event.target.value)} aria-controls="place-results"/>
        {query && <button className="clear-search" type="button" aria-label="清空搜索" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>×</button>}
      </div>
      <div className="mall-filters" role="group" aria-label="按商场筛选">{MALL_FILTERS.map(([value, label]) => <button key={value} type="button" aria-pressed={mall === value} onClick={() => setMall(value)}>{label}</button>)}</div>
    </div>
    <div className="category-filters" role="group" aria-label="按体验类型筛选">
      <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>全部体验</button>
      {categories.map(([value, [label, icon]]) => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}><Icon name={icon} size={15}/>{label}</button>)}
    </div>
    <div className="directory-result-bar"><p className="directory-count" role="status" aria-live="polite" aria-atomic="true">找到 <strong>{found.length}</strong> 个地点<span> / 共 {entries.length} 个</span></p>{filtered && <button type="button" className="text-link" onClick={clearFilters}>清除筛选<Icon name="back" size={14}/></button>}</div>
    <div className="place-directory" id="place-results">
      {found.map(place => {
        const [categoryLabel = "", categoryIcon = "pin"] = CATEGORY_META[place.category] || [];
        return <article className="directory-card" key={place.id}>
          <div className="directory-card-head"><span className={`category-stamp category-${place.category}`}><Icon name={categoryIcon} size={22}/></span><div><small>{place.mall}</small><h3>{place.name}</h3></div></div>
          <p className="directory-floor"><Icon name="pin" size={14}/>{place.floor}</p>
          <div className="directory-card-actions"><a href={amapUrl(place.searchKeyword || `${place.name} 中山`)} target="_blank" rel="noreferrer" aria-label={`查看${place.name}地图（新窗口）`}>查看地图<Icon name="external" size={14}/></a><span>{categoryLabel}</span></div>
          <details><summary>公开资料与到店提醒<Icon name="arrow" size={14}/></summary><p>{place.evidenceNote || "公开资料可支持地址或品牌信息，营业与消费请出发前确认。"}</p>{place.checkedAt && <p className="source-checked">资料查阅：{place.checkedAt} · 营业与铺位以现场为准</p>}<a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.sourceLabel}<Icon name="external" size={13}/></a></details>
        </article>;
      })}
    </div>
    {!found.length && <div className="empty-state"><Icon name="search" size={30}/><h3>暂时没有匹配的地点</h3><p>试试品牌简称，或清除商场与体验类型筛选。</p><button type="button" className="secondary-button" onClick={clearFilters}>查看全部地点<Icon name="arrow" size={16}/></button></div>}
  </div>;
}
