import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock3,
  FileCheck2,
  FileSearch,
  ShieldCheck,
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
import AddSourceDialog from "@/app/Components/Dialogs/AddSourceDialog";
import RunConfigDialog from "@/app/Components/Dialogs/RunConfigDialog";
import SectionTabs from "@/app/Components/Common/SectionTabs";
import StatusChip from "@/app/Components/Common/StatusChip";

type TabKey = "overview" | "sources" | "runs" | "report" | "history";
type RunStatus = "queued" | "running" | "needs_review" | "complete";
type SourceStatus = "indexed" | "ingesting" | "failed";

interface SourceItem {
  id: string;
  name: string;
  type: "URL" | "PDF" | "NOTE";
  status: SourceStatus;
  processedAt: string;
}

interface RunItem {
  id: string;
  label: string;
  status: RunStatus;
  startedAt: string;
  duration: string;
  stepsCompleted: number;
}

interface ActivityItem {
  id: string;
  text: string;
  at: string;
}

interface CaseDetail {
  id: string;
  title: string;
  status: "ANALYZING" | "READY";
  prompt: string;
  summary: string;
  createdAt: string;
  tags: string[];
  stats: {
    sources: number;
    runs: number;
    citations: number;
    lastPublished: string;
  };
  goals: string[];
  sources: SourceItem[];
  runs: RunItem[];
  activity: ActivityItem[];
}

const CASES: CaseDetail[] = [
  {
    id: "c_001",
    title: "2024 Market Entry Strategy",
    status: "ANALYZING",
    prompt: "Should we expand our fintech offering to the UK market?",
    summary:
      "Analysis explores feasibility of entering the UK fintech ecosystem with emphasis on regulatory pathways, cost-to-launch profile, and competitive differentiation in digital banking.",
    createdAt: "Mar 12, 2026",
    tags: ["fintech", "uk-market", "regulation"],
    stats: { sources: 12, runs: 3, citations: 45, lastPublished: "2h ago" },
    goals: [
      "Evaluate FCA licensing requirements for e-money services",
      "Map top competitors in UK digital banking",
      "Analyze consumer adoption for contactless and crypto-backed payments",
      "Estimate initial infrastructure and compliance operating costs",
    ],
    sources: [
      {
        id: "s_1",
        name: "FCA_Guidelines_v4.pdf",
        type: "PDF",
        status: "indexed",
        processedAt: "10 mins ago",
      },
      {
        id: "s_2",
        name: "uk-open-banking-policy.gov",
        type: "URL",
        status: "ingesting",
        processedAt: "2 mins ago",
      },
      {
        id: "s_3",
        name: "competitor-notes.md",
        type: "NOTE",
        status: "failed",
        processedAt: "Yesterday",
      },
    ],
    runs: [
      {
        id: "r_1",
        label: "Run 03 · Opportunity Scoring",
        status: "running",
        startedAt: "8 mins ago",
        duration: "00:08:21",
        stepsCompleted: 72,
      },
      {
        id: "r_2",
        label: "Run 02 · Regulatory Mapping",
        status: "needs_review",
        startedAt: "Yesterday",
        duration: "00:16:13",
        stepsCompleted: 100,
      },
      {
        id: "r_3",
        label: "Run 01 · Baseline Discovery",
        status: "complete",
        startedAt: "2 days ago",
        duration: "00:11:05",
        stepsCompleted: 100,
      },
    ],
    activity: [
      { id: "a1", text: "Analysis run initiated", at: "2m ago" },
      { id: "a2", text: "Source FCA_Guidelines_v4.pdf indexed", at: "10m ago" },
      { id: "a3", text: "Case goals updated", at: "Yesterday" },
    ],
  },
];

const TABS: TabKey[] = ["overview", "sources", "runs", "report", "history"];

function normalizeTab(value?: string | string[]): TabKey {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed && TABS.includes(parsed as TabKey)) {
    return parsed as TabKey;
  }
  return "overview";
}

function findCase(id: string): CaseDetail {
  return CASES.find((entry) => entry.id === id) ?? CASES[0];
}

function sourceStatusClass(status: SourceStatus) {
  if (status === "indexed") return "bg-emerald-100 text-emerald-800";
  if (status === "ingesting") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function runStatusClass(status: RunStatus) {
  if (status === "queued") return "bg-slate-200 text-slate-700";
  if (status === "running") return "bg-sky-100 text-sky-800";
  if (status === "needs_review") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

export async function generateMetadata(
  props: PageProps<"/cases/[id]/details">
): Promise<Metadata> {
  const { id } = await props.params;
  const entry = findCase(id);
  return {
    title: `${entry.title} · Case Details`,
  };
}

export default async function CaseDetailsPage(
  props: PageProps<"/cases/[id]/details">
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const activeTab = normalizeTab(searchParams.tab);
  const entry = findCase(id);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,2.25fr)_330px]">
          <div className="space-y-6">
            <header className="rounded-[28px] bg-gradient-to-br from-[#dbeaf8] to-[#cddff1] p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <StatusChip tone="info" className="bg-slate-900 text-white">
                    {entry.status}
                  </StatusChip>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                    {entry.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-slate-700">{entry.prompt}</p>
                </div>

                <div className="flex gap-2">
                  <RunConfigDialog
                    triggerClassName="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                  />
                  <AddSourceDialog
                    triggerClassName="h-10 rounded-full border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-xs tracking-widest text-slate-500">SOURCES</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">
                    {entry.stats.sources}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-xs tracking-widest text-slate-500">RUNS</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">
                    {entry.stats.runs}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-xs tracking-widest text-slate-500">CITATIONS</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">
                    {entry.stats.citations}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3">
                  <p className="text-xs tracking-widest text-slate-500">
                    LAST PUBLISHED
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">
                    {entry.stats.lastPublished}
                  </p>
                </div>
              </div>
            </header>

            <SectionTabs
              value={activeTab}
              basePath={`/cases/${id}/details`}
              items={TABS.map((tab) => ({
                value: tab,
                label: tab.toUpperCase(),
              }))}
            />

            {activeTab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
                <section>
                  <article className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">
                        Case Brief
                      </h2>
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
                      <h3 className="text-lg font-semibold text-slate-800">
                        Research Goals
                      </h3>
                      <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                        {entry.goals.map((goal) => (
                          <li
                            key={goal}
                            className="flex items-start gap-3 bg-slate-50 px-4 py-3"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 text-slate-500" />
                            <p className="text-sm text-slate-700">{goal}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="my-6 h-px bg-slate-200" />

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Explainability Snapshot
                      </h3>
                      <Accordion
                        type="single"
                        collapsible
                        className="mt-3 gap-2"
                        defaultValue="sources"
                      >
                        <AccordionItem
                          value="sources"
                          className="border border-slate-200 bg-slate-50"
                        >
                          <AccordionTrigger className="py-4 text-sm">
                            What sources were used?
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                            The run relied on regulatory documents, internal
                            notes, and market datasets. Source weighting favors
                            recent and high-confidence references.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem
                          value="citations"
                          className="border border-slate-200 bg-slate-50"
                        >
                          <AccordionTrigger className="py-4 text-sm">
                            How citations work
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                            Each claim maps to source excerpts with metadata and
                            retrieval context, so reviewers can verify evidence
                            before publish.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem
                          value="limits"
                          className="border border-slate-200 bg-slate-50"
                        >
                          <AccordionTrigger className="py-4 text-sm">
                            Known limitations
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4 text-sm text-slate-600">
                            Coverage is lower for proprietary competitor filings
                            and may require manual source uploads for full
                            confidence.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </article>
                </section>

                <aside>
                  <article className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800">
                        Operations Feed
                      </h3>
                      <Link
                        href={`/cases/${id}/details?tab=history`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        VIEW ALL
                      </Link>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {entry.activity.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700"
                        >
                          <p>{item.text}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{item.at}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="my-5 h-px bg-slate-200" />

                    <section className="rounded-2xl bg-slate-900 p-4 text-white">
                      <h3 className="text-lg font-semibold">AI Suggestion</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        Add competitor annual filings to strengthen downside
                        scenario confidence before final review.
                      </p>
                      <Button className="mt-4 h-9 w-full rounded-full bg-white text-xs font-semibold text-slate-900 hover:bg-slate-200">
                        Review Suggestions
                      </Button>
                    </section>
                  </article>
                </aside>
              </div>
            )}

            {activeTab === "sources" && (
              <section className="rounded-[24px] bg-white shadow-sm ring-1 ring-black/5">
                <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">Sources</h2>
                  <Button variant="outline" className="h-9 rounded-full text-xs">
                    Bulk Actions
                  </Button>
                </header>
                <ul className="divide-y divide-slate-100">
                  {entry.sources.map((source) => (
                    <li
                      key={source.id}
                      className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1.7fr_100px_130px_80px]"
                    >
                      <p className="font-medium text-slate-800">{source.name}</p>
                      <p className="text-sm text-slate-500">{source.type}</p>
                      <Badge
                        className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${sourceStatusClass(
                          source.status
                        )}`}
                      >
                        {source.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-slate-500">{source.processedAt}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {activeTab === "runs" && (
              <section className="grid gap-4 md:grid-cols-2">
                {entry.runs.map((run) => (
                  <article
                    key={run.id}
                    className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-slate-800">{run.label}</p>
                      <Badge
                        className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${runStatusClass(
                          run.status
                        )}`}
                      >
                        {run.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Started {run.startedAt} · Duration {run.duration}
                    </p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-700"
                        style={{ width: `${run.stepsCompleted}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Steps completed: {run.stepsCompleted}%
                    </p>
                  </article>
                ))}
              </section>
            )}

            {activeTab === "report" && (
              <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">Report</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Draft report is available with citations attached to each
                  claim. Review and publish when confidence thresholds are met.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="h-9 rounded-full bg-slate-900 px-4 text-xs text-white hover:bg-slate-700">
                    Review & Edit
                  </Button>
                  <Button variant="outline" className="h-9 rounded-full px-4 text-xs">
                    Request Re-run
                  </Button>
                  <Button variant="outline" className="h-9 rounded-full px-4 text-xs">
                    Publish
                  </Button>
                </div>
              </section>
            )}

            {activeTab === "history" && (
              <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">History</h2>
                <ul className="mt-4 space-y-3">
                  {entry.activity.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between rounded-xl bg-slate-100 px-4 py-3"
                    >
                      <p className="text-sm text-slate-700">{item.text}</p>
                      <span className="text-xs text-slate-500">{item.at}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside>
            <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                CASE CONTROL CENTER
              </h3>

              <div className="mt-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  RUN HEALTH
                </p>
                <ul className="mt-3 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock3 className="size-4 text-slate-500" />
                    Last run: {entry.runs[0]?.startedAt}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <Activity className="size-4 text-slate-500" />
                    Active execution checkpoints enabled
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <ShieldCheck className="size-4 text-slate-500" />
                    Citation confidence threshold: 0.82
                  </li>
                </ul>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  QUICK ACTIONS
                </p>
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Open latest run <ArrowUpRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Review failed source <CircleAlert className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Open report draft <FileCheck2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  SOURCE SIGNALS
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <FileSearch className="size-4 text-slate-500" />2 indexed
                    sources used in latest synthesis
                  </p>
                  <p className="flex items-center gap-2">
                    <CircleDashed className="size-4 text-slate-500" />1 source
                    ingesting
                  </p>
                  <p className="flex items-center gap-2">
                    <CircleAlert className="size-4 text-slate-500" />1 source
                    requires manual review
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}
