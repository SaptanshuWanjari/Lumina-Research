import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  CircleCheck,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../../../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ConfirmActionDialog from "@/app/Components/Dialogs/ConfirmActionDialog";
import StatusChip from "@/app/Components/Common/StatusChip";
import { findReport } from "@/lib/mock-reports";

export async function generateMetadata(
  props: PageProps<"/report/[id]/overview">,
): Promise<Metadata> {
  const { id } = await props.params;
  const report = findReport(id);
  return {
    title: `${report.title} · Report Overview`,
  };
}

export default async function ReportOverviewPage(
  props: PageProps<"/report/[id]/overview">,
) {
  const { id } = await props.params;
  const report = findReport(id);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,2.1fr)_340px]">
          <div className="space-y-5">
            <header className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <StatusChip>{report.status}</StatusChip>
                  <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-slate-900">
                    {report.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4" />
                      {report.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4" />
                      {report.readTime}
                    </span>
                    <Badge className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                      {report.version}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-10 rounded-full px-4 text-sm bg-slate-200 font-semibold text-slate-700 hover:cursor-pointer"
                  >
                    Save Draft
                  </Button>
                  <ConfirmActionDialog
                    title="Publish report"
                    description="This will publish the current reviewed draft into the local report library."
                    actionLabel="Publish"
                    actionVariant="default"
                    trigger={
                      <Button className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:cursor-pointer">
                        Publish
                      </Button>
                    }
                  />
                </div>
              </div>
            </header>

            <article className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="max-w-3xl space-y-8">
                <section>
                  <h2 className="text-[34px] font-semibold leading-tight text-slate-900">
                    Executive Summary
                  </h2>
                  <p className="mt-4 text-[22px] leading-[1.55] text-slate-700">
                    {report.executiveSummary}
                    <span className="ml-1 rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800">
                      1
                    </span>
                  </p>
                </section>

                <section>
                  <h2 className="text-[34px] font-semibold leading-tight text-slate-900">
                    Supply Chain Resiliency
                  </h2>
                  <p className="mt-4 text-[22px] leading-[1.55] text-slate-700">
                    {report.resilienceSection}
                    <span className="ml-1 rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-800">
                      2
                    </span>
                  </p>
                </section>
              </div>
            </article>

            <article className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-base font-semibold tracking-[0.06em] text-slate-700">
                Claim Inspector
              </h3>
              <Accordion type="single" collapsible className="mt-3 gap-2">
                <AccordionItem
                  value="claim-1"
                  className="border border-slate-200 bg-slate-50"
                >
                  <AccordionTrigger className="py-4 text-sm">
                    Why is the 24% CAGR claim considered high confidence?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                    The claim is corroborated by two external analyst reports
                    and one earnings transcript segment with aligned trend
                    direction.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="claim-2"
                  className="border border-slate-200 bg-slate-50"
                >
                  <AccordionTrigger className="py-4 text-sm">
                    Ask for stronger citations
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                    Create a review task to request additional validation from
                    narrower vendor-level datasets before publishing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </article>
          </div>

          <aside>
            <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Citations
                  </h3>
                  <p className="text-xs font-semibold tracking-wide text-slate-500">
                    ACTIVE VERIFICATION
                  </p>
                </div>
                <Badge className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold text-sky-800">
                  {report.citations.length} SOURCES
                </Badge>
              </div>

              <ul className="mt-4 divide-y divide-slate-200">
                {report.citations.map((item) => (
                  <li key={item.id} className="py-3">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                      {item.id}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.excerpt}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span>{item.source}</span>
                      <span>•</span>
                      <Link
                        href={`/report/${id}/overview?citation=${item.id}`}
                        className="text-slate-700 hover:text-slate-900"
                      >
                        VERIFY
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-700"
                  style={{ width: `${report.verificationAccuracy}%` }}
                />
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500">
                  CONTEXT DATASETS
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {report.contextDatasets}
                </p>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <h4 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  REPORT STATE
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CircleCheck className="size-4 text-emerald-600" />
                    Draft generated from latest run
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-slate-500" />
                    Citations attached to key claims
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="size-4 text-slate-500" />
                    Ready for reviewer validation
                  </li>
                </ul>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <h4 className="text-sm font-semibold tracking-wide">
                    Review Assistant
                  </h4>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  This draft has strong evidence for sections 1 and 2. Section 3
                  would benefit from one additional independent market dataset.
                </p>
                <Button className="mt-4 h-9 w-full rounded-full bg-white text-xs font-semibold text-slate-900 hover:bg-slate-200 cursor-pointer">
                  Open Suggestions
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}
