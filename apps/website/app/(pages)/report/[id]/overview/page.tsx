import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "../../../../Components/Layout/DashboardLayout";
import { MarkdownRenderer } from "@/app/Components/Report/MarkdownRenderer";
import { ReportExportActions } from "@/app/Components/Report/ReportExportActions";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportDetail } from "@/lib/server/data";
import { formatDateTime } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-sky-100 text-sky-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-100 text-slate-700",
};

export default async function ReportOverviewPage(
  props: PageProps<"/report/[id]/overview">,
) {
  const { id } = await props.params;
  const detail = await getReportDetail(id);
  if (!detail) notFound();

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6" id="report-export-content">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={STATUS_CLASS[detail.report.status] ?? "bg-slate-100 text-slate-700"}
                >
                  {detail.report.status}
                </Badge>
                <Link
                  href={`/cases/${detail.caseItem.id}/details`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
                >
                  {detail.caseItem.title}
                </Link>
              </div>
              <ReportExportActions
                caseTitle={detail.caseItem.title}
                reportTitle={detail.report.title ?? `Report v${detail.report.versionNumber}`}
                contentMarkdown={detail.report.contentMarkdown}
                summary={detail.report.summary}
              />
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              {detail.report.title ?? `Report v${detail.report.versionNumber}`}
            </h1>
            <div className="mt-3 max-w-4xl">
              {detail.report.summary ? (
                <MarkdownRenderer content={detail.report.summary} />
              ) : (
                <p className="text-slate-600">No report summary available.</p>
              )}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">VERSION</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.report.versionNumber}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">CLAIMS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.claims.length}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">CITATIONS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.citations.length}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">UPDATED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.report.updatedAt)}
                </p>
              </article>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" data-export-grid>
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-800">Content</h2>
              <article className="mt-4 rounded-[13px] bg-slate-50 p-5">
                {detail.report.contentMarkdown ? (
                  <MarkdownRenderer content={detail.report.contentMarkdown} />
                ) : (
                  <p className="text-sm text-slate-500">
                    No report markdown stored yet.
                  </p>
                )}
              </article>
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start" data-export-aside>
              <details className="rounded-[13px] bg-white p-4 shadow-sm ring-1 ring-black/5" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Evidence Panel</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Claims and citations
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {detail.claims.length + detail.citations.length} items
                  </span>
                </summary>

                <Tabs defaultValue="claims" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                    <TabsTrigger value="claims">Claims</TabsTrigger>
                    <TabsTrigger value="citations">Citations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="claims" className="mt-4">
                    <div className="space-y-3">
                      {detail.claims.length === 0 ? (
                        <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No structured claims were stored for this report version.
                        </div>
                      ) : (
                        detail.claims.map((claim) => (
                          <article
                            key={claim.id}
                            className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <p className="font-semibold text-slate-900">
                              Claim {claim.claimIndex}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">{claim.claimText}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              Section: {claim.section ?? "n/a"} • Support score: {claim.supportScore ?? "n/a"}
                            </p>
                          </article>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="citations" className="mt-4">
                    <div className="space-y-3">
                      {detail.citations.length === 0 ? (
                        <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No citations stored yet.
                        </div>
                      ) : (
                        detail.citations.map((citation) => (
                          <article
                            key={citation.id}
                            className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <p className="font-semibold text-slate-900">
                              {citation.citationLabel ?? citation.sourceTitle}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                              {citation.excerpt ?? "No excerpt stored."}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              Source: {citation.sourceTitle} • Confidence: {citation.confidence ?? "n/a"}
                            </p>
                          </article>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </details>
            </aside>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
