import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Download,
  FileText,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Square,
} from "lucide-react";

import DashboardLayout from "../../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { RunActionButtons } from "../../../Components/Runs/RunActionButtons";
import { RunReviewButtons } from "../../../Components/Runs/RunReviewButtons";
import { RetryButton } from "../../../Components/Runs/RetryButton";

type RunStatus = "running" | "needs_review" | "complete";
type StepStatus = "queued" | "running" | "success" | "fail" | "paused";

interface RunStep {
  id: string;
  node: string;
  status: StepStatus;
  duration: string;
  goal: string;
  inputs: string;
  output: string;
  error?: string;
}

interface ArtifactItem {
  id: string;
  label: string;
  confidence: string;
}

interface RunDetail {
  runId: string;
  title: string;
  subtitle: string;
  status: RunStatus;
  startedAt: string;
  elapsed: string;
  lastCheckpoint: string;
  canResume: boolean;
  recoveryHint: string;
  estimatedCompletion: string;
  artifacts: ArtifactItem[];
  notes: string[];
  steps: RunStep[];
}

const RUNS: RunDetail[] = [
  {
    runId: "rr-9942-x",
    title: "Market Volatility Synthesis",
    subtitle:
      "Deep trace of autonomous reasoning path regarding Q3 equity shift and volatility impact.",
    status: "needs_review",
    startedAt: "Today, 10:14 AM",
    elapsed: "18m 09s",
    lastCheckpoint: "Today, 10:29 AM",
    canResume: true,
    recoveryHint: "Resume from Synthesizer checkpoint after human review.",
    estimatedCompletion: "2m 14s",
    artifacts: [
      { id: "a1", label: "SEC-10K_AAPL.pdf", confidence: "98%" },
      { id: "a2", label: "Market_Pulse_Report.csv", confidence: "84%" },
      { id: "a3", label: "Daily_Quotes.csv", confidence: "100%" },
    ],
    notes: [
      "Draft report created from retrieval set v-path-44.",
      "Conflict detected between sentiment and quantitative drift outputs.",
      "Human intervention needed before publish stage.",
    ],
    steps: [
      {
        id: "s1",
        node: "Planner",
        status: "success",
        duration: "00:01:16",
        goal: "Decompose user objective into traceable sub-tasks.",
        inputs: "Prompt context + strategy template v3",
        output: "Generated 4 logic nodes for retrieval and synthesis.",
      },
      {
        id: "s2",
        node: "Retriever",
        status: "success",
        duration: "00:04:42",
        goal: "Retrieve cross-source evidence for equity volatility theme.",
        inputs: "Bloomberg terminal + Reuters API + internal docs",
        output: "12.4k documents accessed, 83 high-relevance chunks retained.",
      },
      {
        id: "s3",
        node: "Synthesizer",
        status: "paused",
        duration: "00:06:03",
        goal: "Merge quantitative and sentiment streams into a coherent thesis.",
        inputs: "Retriever output + sentiment model predictions",
        output: "Contradictory signals between macro-sentiment and drift agents.",
        error:
          "Paused: review required due to confidence divergence over threshold.",
      },
      {
        id: "s4",
        node: "Citation Checker",
        status: "queued",
        duration: "--",
        goal: "Verify claim-to-source linkage integrity.",
        inputs: "Pending synthesizer approval",
        output: "Not executed yet.",
      },
      {
        id: "s5",
        node: "Publisher",
        status: "queued",
        duration: "--",
        goal: "Finalize the validated report in the local report library.",
        inputs: "Pending downstream gate completion",
        output: "Not executed yet.",
      },
    ],
  },
  {
    runId: "rr-8801-a",
    title: "Rates Shock Scenario",
    subtitle: "Stress-test synthesis for treasury and lending book exposure.",
    status: "complete",
    startedAt: "Yesterday, 08:42 PM",
    elapsed: "13m 44s",
    lastCheckpoint: "Yesterday, 08:55 PM",
    canResume: false,
    recoveryHint: "Run is complete. Start a new run for revisions.",
    estimatedCompletion: "Done",
    artifacts: [
      { id: "a1", label: "Rates_Forecast_2026.pdf", confidence: "97%" },
      { id: "a2", label: "Yield_Curve_Shifts.csv", confidence: "92%" },
    ],
    notes: ["Run completed successfully.", "Report draft v1.1 ready."],
    steps: [
      {
        id: "s1",
        node: "Planner",
        status: "success",
        duration: "00:00:55",
        goal: "Task decomposition for rates stress scenario.",
        inputs: "Case objectives",
        output: "3-step execution plan produced.",
      },
      {
        id: "s2",
        node: "Retriever",
        status: "success",
        duration: "00:03:14",
        goal: "Collect treasury market and macro indicators.",
        inputs: "External and internal data indices",
        output: "Data retrieval complete.",
      },
      {
        id: "s3",
        node: "Synthesizer",
        status: "success",
        duration: "00:05:02",
        goal: "Produce ranked risk scenarios.",
        inputs: "Curated retrieval set",
        output: "Draft report produced with confidence > 0.9.",
      },
      {
        id: "s4",
        node: "Publisher",
        status: "success",
        duration: "00:01:11",
        goal: "Write final output to the local report library.",
        inputs: "Approved draft",
        output: "Published report and trace.",
      },
    ],
  },
];

function findRun(runId: string): RunDetail {
  return RUNS.find((run) => run.runId === runId) ?? RUNS[0];
}

function stepStatusClass(status: StepStatus) {
  if (status === "success") return "bg-emerald-100 text-emerald-700";
  if (status === "running") return "bg-sky-100 text-sky-700";
  if (status === "paused") return "bg-amber-100 text-amber-800";
  if (status === "fail") return "bg-rose-100 text-rose-700";
  return "bg-slate-200 text-slate-600";
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "success") return <CheckCircle2 className="size-4" />;
  if (status === "running") return <PlayCircle className="size-4" />;
  if (status === "paused") return <PauseCircle className="size-4" />;
  if (status === "fail") return <AlertTriangle className="size-4" />;
  return <CircleDashed className="size-4" />;
}

export async function generateMetadata(
  props: PageProps<"/runs/[runId]">
): Promise<Metadata> {
  const { runId } = await props.params;
  const run = findRun(runId);
  return {
    title: `${run.title} · Run Detail`,
  };
}

export default async function RunDetailPage(props: PageProps<"/runs/[runId]">) {
  const { runId } = await props.params;
  const run = findRun(runId);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,2.1fr)_330px]">
          <div className="space-y-5">
            <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-slate-200 px-3 py-1 text-[12px] font-semibold tracking-[0.14em] text-slate-700">
                      ACTIVE RUN
                    </Badge>
                    <p className="text-sm text-slate-500">#{run.runId}</p>
                  </div>
                  <h1 className="mt-2 text-5xl font-semibold leading-tight text-slate-900">
                    {run.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">
                    {run.subtitle}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4" />
                      Started {run.startedAt}
                    </span>
                    <span>Elapsed {run.elapsed}</span>
                    <span>Last checkpoint {run.lastCheckpoint}</span>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <RunActionButtons status={run.status} />
                </div>
              </div>
            </header>

            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">
                  Steps Timeline
                </h2>
                <p className="text-sm text-slate-500">
                  Est. Completion: {run.estimatedCompletion}
                </p>
              </div>

              <Accordion type="single" collapsible className="mt-4 gap-2" defaultValue="s1">
                {run.steps.map((step) => (
                  <AccordionItem
                    key={step.id}
                    value={step.id}
                    className="border border-slate-200 bg-slate-50"
                  >
                    <AccordionTrigger className="py-4">
                      <div className="flex w-full items-center justify-between gap-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${stepStatusClass(
                              step.status
                            )}`}
                          >
                            <StepIcon status={step.status} />
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-800">
                              {step.node}
                            </p>
                            <p className="text-xs text-slate-500">
                              Duration: {step.duration}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${stepStatusClass(
                            step.status
                          )}`}
                        >
                          {step.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-800">Goal:</span>{" "}
                        {step.goal}
                      </p>
                      <p className="mt-2">
                        <span className="font-semibold text-slate-800">Inputs:</span>{" "}
                        {step.inputs}
                      </p>
                      <p className="mt-2">
                        <span className="font-semibold text-slate-800">Output:</span>{" "}
                        {step.output}
                      </p>
                      {step.error ? (
                        <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
                          <p className="font-semibold">Error details</p>
                          <p className="mt-1 text-sm">{step.error}</p>
                          <RetryButton />
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-base font-semibold text-slate-800">Output Artifacts</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <article className="rounded-[13px] bg-slate-100 p-4">
                  <p className="text-[14px] font-semibold tracking-[0.14em] text-slate-500">
                    DRAFT REPORT
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Ready for review with citation markers.
                  </p>
                </article>
                <article className="rounded-[13px] bg-slate-100 p-4">
                  <p className="text-[14px] font-semibold tracking-[0.14em] text-slate-500">
                    RETRIEVAL SET
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {run.artifacts.length} top artifacts retained for synthesis.
                  </p>
                </article>
                <article className="rounded-[13px] bg-slate-100 p-4">
                  <p className="text-[14px] font-semibold tracking-[0.14em] text-slate-500">
                    CRITIC NOTES
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Divergence alerts detected in one downstream node.
                  </p>
                </article>
              </div>
            </section>
          </div>

          <aside>
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                RUN CONTROL CENTER
              </h3>

              <div className="mt-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  RUN SNAPSHOT
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="rounded-xl bg-slate-100 px-3 py-3">
                    <p className="text-xs font-semibold tracking-[0.14em] text-slate-500">
                      CURRENT STATE
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {run.status === "needs_review"
                        ? "Review required before continuing."
                        : run.status === "running"
                          ? "Analysis is currently executing."
                          : "Run completed and stored locally."}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{run.recoveryHint}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-3">
                    <p className="text-xs font-semibold tracking-[0.14em] text-slate-500">
                      ESTIMATED COMPLETION
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {run.estimatedCompletion}
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  RETRIEVAL ARTIFACTS
                </p>
                <ul className="mt-3 space-y-2">
                  {run.artifacts.map((artifact) => (
                    <li
                      key={artifact.id}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    >
                      <p className="font-medium">{artifact.label}</p>
                      <p className="text-xs text-slate-500">
                        Confidence: {artifact.confidence}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  RUN NOTES
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {run.notes.map((note) => (
                    <li key={note} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 size-4 text-slate-500" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {run.status === "needs_review" && (
                <>
                  <div className="my-5 h-px bg-slate-200" />
                  <div className="rounded-[13px] bg-amber-50 p-4">
                    <h4 className="text-sm font-semibold text-amber-900">
                      Human Intervention Needed
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-amber-900">
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 size-4" />
                        Are claims supported?
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="mt-0.5 size-4" />
                        Are citations adequate?
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4" />
                        Sensitive content concerns?
                      </li>
                    </ul>
                    <RunReviewButtons />
                  </div>
                </>
              )}
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}
