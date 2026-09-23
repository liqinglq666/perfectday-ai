"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import AdjustmentFieldsPanel from "@/app/components/adjust/adjustment-fields";
import AdjustmentOptions from "@/app/components/adjust/adjustment-options";
import AdjustmentPreview from "@/app/components/adjust/adjustment-preview";
import AdjustmentSavebar from "@/app/components/adjust/adjustment-savebar";
import Icon from "@/app/components/ui-icon";
import {
  adjustmentFieldsFromJourney,
  isValidAdjustmentFields,
  type AdjustmentFields
} from "@/lib/adjustment-form";
import {
  applyRemainingFields,
  journeyPlan,
  journeyUrl,
  replanRemaining,
  type Journey
} from "@/lib/journey";
import { queryString } from "@/lib/planner";
import { UNDO_TRIP_KEY } from "@/lib/trip-storage";
import type { AdjustmentChange, PlanInput } from "@/types";

type Props = {
  input: PlanInput;
  original: Journey;
  initial: Journey;
  initialChanges: AdjustmentChange[];
};

export default function AdjustEditor({ input, original, initial, initialChanges }: Props) {
  const [values, setValues] = useState(() => adjustmentFieldsFromJourney(initial));
  const [changes, setChanges] = useState(initialChanges);
  const [saving, startSaving] = useTransition();
  const router = useRouter();
  const previewRef = useRef<HTMLHeadingElement>(null);

  const draft = applyRemainingFields(original, values);
  const valid = isValidAdjustmentFields(values);
  const { journey, removed } = replanRemaining(input, draft, changes);
  const plan = journeyPlan(journey, input);
  const before = journeyPlan(original, input);
  const dirty = changes.length > 0 || JSON.stringify(values) !== JSON.stringify(adjustmentFieldsFromJourney(original));
  const doneCount = original.done.filter(stop => stop.id !== "connector").length;
  const count = plan.stops.filter(stop => stop.id !== "connector").length;

  function update(key: keyof AdjustmentFields, value: string) {
    setValues(previous => ({ ...previous, [key]: value }));
  }

  function reset() {
    setValues(adjustmentFieldsFromJourney(original));
    setChanges([]);
  }

  function toggleChange(value: AdjustmentChange, checked: boolean) {
    setChanges(previous => checked ? [...previous, value] : previous.filter(item => item !== value));
  }

  function preview() {
    previewRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
    previewRef.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    if (!valid) {
      event.preventDefault();
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value !== "save") {
      event.preventDefault();
      preview();
      return;
    }

    event.preventDefault();
    if (saving) return;

    const target = journeyUrl(input, journey);
    try {
      sessionStorage.setItem(UNDO_TRIP_KEY, JSON.stringify({
        from: journeyUrl(input, original),
        to: target,
        label: "保存这次调整"
      }));
    } catch {
      // Saving does not require storage.
    }
    startSaving(() => router.push(target));
  }

  return <main id="main-content" className="page adjust-page">
    <div className="page-topline">
      <Link className="back-link" href={journeyUrl(input, original)}><Icon name="back" size={17}/>取消调整，返回行程</Link>
      <span className="quiet-label">途中调整</span>
    </div>

    <header className="adjust-heading adjust-heading-with-visual">
      <div className="adjust-heading-copy">
        <p className="eyebrow">把下一段，安排得刚刚好</p>
        <h1>计划有变，也没关系。</h1>
        <p>已完成的 {doneCount} 站会保留，只调整还没去的地方。</p>
      </div>
      <div className="adjust-heading-visual" aria-hidden="true">
        <Image src="/images/ui/replan/perfectday-replan-banner.png" alt="" fill priority sizes="(max-width: 760px) calc(100vw - 36px), 420px"/>
      </div>
    </header>

    <p className="draft-notice"><Icon name="sliders" size={17}/><span><strong>{dirty ? "有尚未保存的调整" : "先看看，再决定"}</strong>预览不会修改原行程，点击保存后才会生效。</span></p>

    <div className="adjust-layout">
      <section className="adjust-options" aria-label="调整条件">
        <form id="remaining-form" action="/adjust" onSubmit={submit} className="remaining-form" aria-busy={saving}>
          {[...new URLSearchParams(queryString(input))].map(([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}
          <input type="hidden" name="journey" value={JSON.stringify(original)}/>
          <AdjustmentFieldsPanel values={values} onChange={update} onReset={reset}/>
          <AdjustmentOptions changes={changes} valid={valid} onToggle={toggleChange}/>
        </form>
      </section>

      <section className="replan-card" aria-labelledby="preview-title">
        <AdjustmentPreview
          valid={valid}
          doneCount={doneCount}
          journey={journey}
          plan={plan}
          before={before}
          removed={removed}
          previewRef={previewRef}
          onReset={reset}
        />
        <AdjustmentSavebar
          valid={valid}
          saving={saving}
          count={count}
          totalPrice={plan.totalPrice}
          onPreview={preview}
        />
      </section>
    </div>
  </main>;
}
