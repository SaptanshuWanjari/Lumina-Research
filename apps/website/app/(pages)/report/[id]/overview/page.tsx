import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "../../../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
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
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={STATUS_CLASS[detail.report.status] ?? "bg-slate-100 text-slate-700"}>
                {detail.report.status}
              </Badge>
              <Link
                href={`/cases/${detail.caseItem.id}/details`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
              >
                {detail.caseItem.title}
              </Link>
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              {detail.report.title ?? `Report v${detail.report.versionNumber}`}
            </h1>
            <p className="mt-3 max-w-4xl text-slate-600">
              {detail.report.summary ?? "No report summary available."}
            </p>
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

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-800">Content</h2>
              <article className="mt-4 rounded-[13px] bg-slate-50 p-5">
                <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {detail.report.contentMarkdown ?? "No report markdown stored yet."}
                </pre>
              </article>
            </section>

            <section className="space-y-6">
              <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">Claims</h2>
                <div className="mt-4 space-y-3">
                  {detail.claims.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
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
              </article>

              <article className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">Citations</h2>
                <div className="mt-4 space-y-3">
                  {detail.citations.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
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
              </article>
            </section>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
