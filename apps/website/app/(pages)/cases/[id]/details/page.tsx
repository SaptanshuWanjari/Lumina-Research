import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "../../../../Components/Layout/DashboardLayout";
import { StartRunButton } from "@/app/Components/Cases/StartRunButton";
import AddSourceDialog from "@/app/Components/Dialogs/AddSourceDialog";
import { Badge } from "@/components/ui/badge";
import { getCaseDetail } from "@/lib/server/data";
import {
  formatDateTime,
  formatDurationMs,
  formatRelativeDate,
  truncateText,
} from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  ingesting: "bg-amber-100 text-amber-800",
  indexed: "bg-emerald-100 text-emerald-800",
  analyzing: "bg-sky-100 text-sky-800",
  review: "bg-orange-100 text-orange-800",
  published: "bg-violet-100 text-violet-800",
  failed: "bg-rose-100 text-rose-800",
};

export default async function CaseDetailsPage(
  props: PageProps<"/cases/[id]/details">,
) {
  const { id } = await props.params;
  const detail = await getCaseDetail(id);
  if (!detail) notFound();

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={STATUS_CLASS[detail.caseItem.status] ?? "bg-slate-100 text-slate-700"}>
                    {detail.caseItem.status}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700">
                    priority: {detail.caseItem.priority}
                  </Badge>
                </div>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                  {detail.caseItem.title}
                </h1>
                <p className="mt-3 max-w-4xl text-slate-600">
                  {detail.caseItem.question ?? detail.caseItem.summary ?? "No case question set."}
                </p>
                {detail.caseItem.tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detail.caseItem.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <AddSourceDialog
                  caseId={detail.caseItem.id}
                  triggerClassName="h-10 rounded-full border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800"
                />
                <StartRunButton caseId={detail.caseItem.id} />
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">SOURCES</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{detail.sources.length}</p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">RUNS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{detail.runs.length}</p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">REPORTS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{detail.reports.length}</p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">UPDATED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.caseItem.updatedAt)}
                </p>
              </article>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Sources</h2>
                <span className="text-sm text-slate-500">{detail.sources.length} total</span>
              </div>
              <div className="mt-4 space-y-3">
                {detail.sources.length === 0 ? (
                  <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Add a source to enqueue ingestion.
                  </div>
                ) : (
                  detail.sources.map((source) => (
                    <Link
                      key={source.id}
                      href={`/cases/${detail.caseItem.id}/sources/${source.id}`}
                      className="block rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{source.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {source.sourceType.toUpperCase()}
                            {source.url ? ` • ${truncateText(source.url, 72)}` : ""}
                          </p>
                        </div>
                        <Badge className={STATUS_CLASS[source.status] ?? "bg-slate-100 text-slate-700"}>
                          {source.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="space-y-6">
              <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Runs</h2>
                  <span className="text-sm text-slate-500">{detail.runs.length} total</span>
                </div>
                <div className="mt-4 space-y-3">
                  {detail.runs.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      No runs started yet.
                    </div>
                  ) : (
                    detail.runs.map((run) => (
                      <Link
                        key={run.id}
                        href={`/runs/${run.id}`}
                        className="block rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{run.currentStep ?? "Run"}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              Started {formatRelativeDate(run.startedAt)}
                              {run.durationMs ? ` • ${formatDurationMs(run.durationMs)}` : ""}
                            </p>
                          </div>
                          <Badge className={STATUS_CLASS[run.status] ?? "bg-slate-100 text-slate-700"}>
                            {run.status}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Reports</h2>
                  <span className="text-sm text-slate-500">{detail.reports.length} versions</span>
                </div>
                <div className="mt-4 space-y-3">
                  {detail.reports.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      No draft or published report exists yet.
                    </div>
                  ) : (
                    detail.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/report/${report.id}/overview`}
                        className="block rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {report.title ?? `Report v${report.versionNumber}`}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Version {report.versionNumber} • Updated {formatRelativeDate(report.updatedAt)}
                            </p>
                          </div>
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
