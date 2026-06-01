import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CaseDetailRecord } from "@/lib/data/mock-cases";

interface CaseOverviewPanelProps {
  entry: CaseDetailRecord;
  caseId: string;
}

export default function CaseOverviewPanel({ entry, caseId }: CaseOverviewPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
      <section>
        <article className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Case Brief</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              {entry.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-semibold tracking-wide text-slate-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Created: {entry.createdAt}</p>
          </div>

          <div className="my-6 h-px bg-slate-200" />

          <div>
            <h3 className="text-lg font-semibold text-slate-800">Research Goals</h3>
            <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-[13px] border border-slate-200">
              {entry.goals.map((goal) => (
                <li key={goal} className="flex items-start gap-3 bg-slate-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-slate-500" />
                  <p className="text-sm text-slate-700">{goal}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="my-6 h-px bg-slate-200" />

          <div>
            <h3 className="text-lg font-semibold text-slate-800">Explainability Snapshot</h3>
            <Accordion type="single" collapsible className="mt-3 gap-2" defaultValue="sources">
              <AccordionItem value="sources" className="border border-slate-200 bg-slate-50">
                <AccordionTrigger className="py-4 text-sm">What sources were used?</AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                  The run relied on regulatory documents, internal notes, and market datasets.
                  Source weighting favors recent and high-confidence references.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="citations" className="border border-slate-200 bg-slate-50">
                <AccordionTrigger className="py-4 text-sm">How citations work</AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                  Each claim maps to source excerpts with metadata and retrieval context, so
                  reviewers can verify evidence before publish.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="limits" className="border border-slate-200 bg-slate-50">
                <AccordionTrigger className="py-4 text-sm">Known limitations</AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                  Coverage is lower for proprietary competitor filings and may require manual
                  source uploads for full confidence.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </article>
      </section>

      <aside>
        <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Operations Feed</h3>
            <Link
              href={`/cases/${caseId}/details?tab=history`}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              VIEW ALL
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {entry.activity.map((item) => (
              <li key={item.id} className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                <p>{item.text}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.at}</p>
              </li>
            ))}
          </ul>

          <div className="my-5 h-px bg-slate-200" />

          <section className="rounded-[13px] bg-slate-900 p-4 text-white">
            <h3 className="text-lg font-semibold">AI Suggestion</h3>
            <p className="mt-2 text-sm text-slate-300">
              Add competitor annual filings to strengthen downside scenario confidence before
              final review.
            </p>
          </section>
        </article>
      </aside>
    </div>
  );
}
