"use client";

import { Button } from "@/components/ui/button";
import type { CitationItem } from "@/lib/mock-reports";

interface ClaimInspectorProps {
  claim: string;
  citation?: CitationItem;
}

export default function ClaimInspector({ claim, citation }: ClaimInspectorProps) {
  return (
    <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-base font-semibold tracking-[0.06em] text-slate-700">Claim Inspector</h3>
      <p className="mt-3 text-sm text-slate-600">{claim}</p>

      <div className="mt-4 rounded-[13px] bg-slate-50 p-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-500">SUPPORTED BY</p>
        {citation ? (
          <>
            <p className="mt-2 text-sm font-semibold text-slate-800">{citation.title}</p>
            <p className="mt-1 text-sm text-slate-600">{citation.excerpt}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{citation.source}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Select a citation marker to inspect support.</p>
        )}
      </div>

      <Button 
        onClick={() => {
          console.log("Ask for stronger citations: Re-evaluating claim with stricter criteria...");
          alert("Ask for stronger citations: Re-evaluating claim with stricter criteria...");
        }}
        variant="outline" 
        className="mt-3 h-9 rounded-full text-xs"
      >
        Ask for stronger citations
      </Button>
    </section>
  );
}
