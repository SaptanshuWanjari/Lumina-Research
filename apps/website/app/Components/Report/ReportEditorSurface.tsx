"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ReportOverview } from "@/lib/mock-reports";

interface ReportEditorSurfaceProps {
  report: ReportOverview;
  selectedCitationId?: string;
  onSelectCitation: (id: string) => void;
  onSelectClaim: (claim: string) => void;
}

export default function ReportEditorSurface({
  report,
  selectedCitationId,
  onSelectCitation,
  onSelectClaim,
}: ReportEditorSurfaceProps) {
  const [draftState, setDraftState] = useState<"Saved" | "Saving" | "Offline">("Saved");

  const sections = useMemo(
    () => [
      {
        id: "executive-summary",
        heading: "Executive Summary",
        body: report.executiveSummary,
        marker: report.citations[0]?.id ?? "01",
      },
      {
        id: "resilience",
        heading: "Supply Chain Resiliency",
        body: report.resilienceSection,
        marker: report.citations[1]?.id ?? "02",
      },
    ],
    [report]
  );

  const triggerAutosave = () => {
    setDraftState("Saving");
    setTimeout(() => {
      setDraftState("Saved");
    }, 700);
  };

  return (
    <article className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-slate-500">
          <span>REPORT EDITOR</span>
          <span>•</span>
          <span>{draftState}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 rounded-full px-3 text-xs" onClick={triggerAutosave}>
            Save Now
          </Button>
          <Button variant="outline" className="h-8 rounded-full px-3 text-xs" onClick={() => setDraftState("Offline")}>
            Go Offline
          </Button>
          <Button variant="outline" className="h-8 rounded-full px-3 text-xs" onClick={() => setDraftState("Saved")}>
            Reconnect
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="text-3xl font-semibold leading-tight text-slate-900">{section.heading}</h2>
            <p className="mt-3 text-lg leading-[1.55] text-slate-700">
              <button
                type="button"
                className="text-left hover:text-slate-900"
                onClick={() => {
                  onSelectClaim(section.body);
                  triggerAutosave();
                }}
              >
                {section.body}
              </button>
              <button
                type="button"
                onClick={() => onSelectCitation(section.marker)}
                className={`ml-2 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                  selectedCitationId === section.marker
                    ? "bg-slate-900 text-white"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {section.marker}
              </button>
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
