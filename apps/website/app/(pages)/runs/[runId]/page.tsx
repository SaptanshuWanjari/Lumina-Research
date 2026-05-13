import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "../../../Components/Layout/DashboardLayout";
import { ApproveRunButton } from "@/app/Components/Runs/ApproveRunButton";
import { Badge } from "@/components/ui/badge";
import { getRunDetail } from "@/lib/server/data";
import { formatDateTime, formatDurationMs } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  running: "bg-sky-100 text-sky-800",
  needs_review: "bg-amber-100 text-amber-800",
  resuming: "bg-blue-100 text-blue-800",
  complete: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-700",
};

export default async function RunPage(props: PageProps<"/runs/[runId]">) {
  const { runId } = await props.params;
  const detail = await getRunDetail(runId);
  if (!detail) notFound();

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={STATUS_CLASS[detail.run.status] ?? "bg-slate-100 text-slate-700"}>
                    {detail.run.status}
                  </Badge>
                  <Link
                    href={`/cases/${detail.caseItem.id}/details`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
                  >
                    {detail.caseItem.title}
                  </Link>
                </div>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                  Run Trace
                </h1>
                <p className="mt-3 text-slate-600">
                  Current step: {detail.run.currentStep ?? "unknown"}
                </p>
              </div>
              {detail.run.needsReview ? <ApproveRunButton runId={detail.run.id} /> : null}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">STARTED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.run.startedAt)}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">COMPLETED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.run.completedAt)}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">DURATION</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDurationMs(detail.run.durationMs)}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">ARTIFACTS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.artifacts.length}
                </p>
              </article>
            </div>
            {detail.run.reviewSummary ? (
              <div className="mt-5 rounded-[13px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {detail.run.reviewSummary}
              </div>
            ) : null}
            {detail.run.errorMessage ? (
              <div className="mt-3 rounded-[13px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detail.run.errorMessage}
              </div>
            ) : null}
          </header>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-800">Run Steps</h2>
              <div className="mt-4 space-y-3">
                {detail.steps.map((step) => (
                  <article
                    key={step.id}
                    className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">
                        {step.stepOrder}. {step.stepKey}
                      </p>
                      <Badge className={STATUS_CLASS[step.status] ?? "bg-slate-100 text-slate-700"}>
                        {step.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {step.goal ?? "No goal recorded."}
                    </p>
                    {step.errorMessage ? (
                      <p className="mt-2 text-sm text-rose-700">{step.errorMessage}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">
                      Started {formatDateTime(step.startedAt)} • Completed {formatDateTime(step.completedAt)} • Duration {formatDurationMs(step.durationMs)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">Artifacts</h2>
                <div className="mt-4 space-y-3">
                  {detail.artifacts.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      No artifacts persisted yet.
                    </div>
                  ) : (
                    detail.artifacts.map((artifact) => (
                      <article
                        key={artifact.id}
                        className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="font-semibold text-slate-900">
                          {artifact.title ?? artifact.artifactType}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {artifact.artifactType}
                        </p>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">
                          {JSON.stringify(artifact.payloadJson, null, 2)}
                        </pre>
                      </article>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">Report Versions</h2>
                <div className="mt-4 space-y-3">
                  {detail.reports.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      No report versions persisted for this run.
                    </div>
                  ) : (
                    detail.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/report/${report.id}/overview`}
                        className="block rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-slate-900">
                            {report.title ?? `Report v${report.versionNumber}`}
                          </p>
                          <Badge className={STATUS_CLASS[report.status] ?? "bg-slate-100 text-slate-700"}>
                            {report.status}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </article>
            </section>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
