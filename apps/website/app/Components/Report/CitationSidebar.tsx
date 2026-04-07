"use client";

import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import type { CitationItem } from "@/lib/mock-reports";

interface CitationSidebarProps {
  citations: CitationItem[];
  selectedCitationId?: string;
  onSelectCitation: (id: string) => void;
}

export default function CitationSidebar({
  citations,
  selectedCitationId,
  onSelectCitation,
}: CitationSidebarProps) {
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!selectedCitationId || !listRef.current) return;
    const target = listRef.current.querySelector(`[data-citation-id="${selectedCitationId}"]`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedCitationId]);

  return (
    <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Citations</h3>
        <Badge className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold text-sky-800">
          {citations.length} SOURCES
        </Badge>
      </div>

      <ul ref={listRef} className="mt-4 max-h-[440px] divide-y divide-slate-200 overflow-auto">
        {citations.map((item) => {
          const active = item.id === selectedCitationId;
          return (
            <li key={item.id} data-citation-id={item.id} className="py-3">
              <button
                type="button"
                onClick={() => onSelectCitation(item.id)}
                className={`w-full rounded-xl px-2 py-2 text-left ${
                  active ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">{item.id}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.excerpt}</p>
                <p className="mt-2 text-[11px] font-semibold text-slate-500">{item.source}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
