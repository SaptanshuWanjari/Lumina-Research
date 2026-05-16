import Link from "next/link";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { CreateCaseButton } from "@/app/Components/Cases/CreateCaseButton";
import { getDashboardData } from "@/lib/server/data";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  ingesting: "bg-amber-100 text-amber-800",
  indexed: "bg-emerald-100 text-emerald-800",
  analyzing: "bg-sky-100 text-sky-800",
  review: "bg-orange-100 text-orange-800",
  published: "bg-violet-100 text-violet-800",
  failed: "bg-rose-100 text-rose-800",
};

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Dashboard
            </h1>
          </div>

          <CreateCaseButton className="px-6 py-6 text-lg bg-slate-900 hover:bg-slate-800 rounded-2xl" showIcon={true} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Cases", value: dashboard.counts.totalCases },
            { label: "Indexed Sources", value: dashboard.counts.indexedSources },
            { label: "Runs Needing Review", value: dashboard.counts.reviewRuns },
            { label: "Published Reports", value: dashboard.counts.publishedReports },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">
                {item.value}
              </p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Recent Cases</h2>
              <Link href="/cases" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.recentCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}/details`}
                  className="block rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{caseItem.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {caseItem.question ?? "No case question set."}
                      </p>
                    </div>
                    <Badge className={STATUS_CLASS[caseItem.status] ?? "bg-slate-100 text-slate-700"}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Updated {formatRelativeDate(caseItem.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-semibold text-slate-800">Needs Review</h2>
            <div className="mt-4 space-y-3">
              {dashboard.reviewRuns.length === 0 ? (
                <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No runs are paused for review.
                </div>
              ) : (
                dashboard.reviewRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/runs/${run.id}`}
                    className="block rounded-[13px] border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100"
                  >
                    <p className="font-semibold text-slate-900">{run.currentStep ?? "Human review"}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {run.reviewSummary ?? "Review requested by orchestrator."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated {formatRelativeDate(run.updatedAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
