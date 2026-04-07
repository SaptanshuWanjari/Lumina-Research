import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSourceById, type CaseSourceSummary } from "@/lib/mock-cases";

interface CaseSourcesPanelProps {
  caseId: string;
  sources: CaseSourceSummary[];
  activeSourceId?: string;
}

function sourceStatusClass(status: CaseSourceSummary["status"]) {
  if (status === "indexed") return "bg-emerald-100 text-emerald-800";
  if (status === "ingesting") return "bg-amber-100 text-amber-800";
  if (status === "pending") return "bg-slate-200 text-slate-700";
  return "bg-rose-100 text-rose-800";
}

export default function CaseSourcesPanel({
  caseId,
  sources,
  activeSourceId,
}: CaseSourcesPanelProps) {
  return (
    <section className="rounded-[13px] bg-white shadow-sm ring-1 ring-black/5">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Sources</h2>
        <Button variant="outline" className="h-9 rounded-full text-xs">
          Bulk Actions
        </Button>
      </header>
      <ul className="divide-y divide-slate-100">
        {sources.map((source) => {
          const expanded = activeSourceId === source.sourceId;
          const detail = getSourceById(caseId, source.sourceId);

          return (
            <li key={source.id} className="px-5 py-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.7fr_100px_130px_110px_100px]">
                <Link
                  href={`/cases/${caseId}/sources/${source.sourceId}`}
                  className="font-medium text-slate-800 hover:text-slate-950"
                >
                  {source.name}
                </Link>
                <p className="text-sm text-slate-500">{source.type}</p>
                <Badge
                  className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${sourceStatusClass(
                    source.status
                  )}`}
                >
                  {source.status.toUpperCase()}
                </Badge>
                <p className="text-xs text-slate-500">{source.processedAt}</p>
                <Link
                  href={`/cases/${caseId}/details?tab=sources&source=${source.sourceId}`}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  {expanded ? "Hide" : "Expand"}
                </Link>
              </div>

              {expanded ? (
                <div className="mt-3 space-y-3 rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
                      EXTRACT PREVIEW
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{detail.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-200 px-2 py-1 font-semibold">
                      {detail.chunksCount} chunks
                    </span>
                    <span>{detail.modelUsed}</span>
                  </div>

                  {detail.errors?.length ? (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="errors" className="border border-rose-200 bg-rose-50">
                        <AccordionTrigger className="px-3 py-2 text-sm text-rose-900">
                          View Error Details
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 px-3 pb-3 text-sm text-rose-800">
                          {detail.errors.map((error) => (
                            <div key={error.title}>
                              <p className="font-semibold">{error.title}</p>
                              <p>{error.detail}</p>
                              <p className="text-xs">Fix: {error.fix}</p>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
