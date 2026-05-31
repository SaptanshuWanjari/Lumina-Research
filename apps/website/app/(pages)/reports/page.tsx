import Link from "next/link";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { listReports } from "@/lib/server/data";
import { formatRelativeDate, truncateText } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-sky-100 text-sky-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-100 text-slate-700",
};

export default async function ReportsPage(props: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const query = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q)?.trim().toLowerCase() ?? "";
  const status = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const allReports = await listReports();
  const reports = allReports.filter((report) => {
    const matchesQuery =
      !query ||
      `${report.title ?? ""} ${report.summary ?? ""} ${report.status}`
        .toLowerCase()
        .includes(query);
    const matchesStatus = !status || status === "all" || report.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h1 className="text-4xl font-semibold text-slate-900">Reports</h1>
            <form className="mt-5 flex flex-wrap gap-3" action="/reports">
              <input
                name="q"
                defaultValue={query}
                placeholder="Search reports"
                className="h-10 min-w-70 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm"
              />
              <select
                name="status"
                defaultValue={status ?? "all"}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <button className="h-10 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white">
                Filter
              </button>
            </form>
          </header>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="rounded-[13px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-600">
                No reports match the current filter.
              </div>
            ) : (
              reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/report/${report.id}/overview`}
                  className="block rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-slate-900">
                          {report.title ?? `Report v${report.versionNumber}`}
                        </h2>
                        <Badge className={STATUS_CLASS[report.status] ?? "bg-slate-100 text-slate-700"}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {truncateText(report.summary ?? "No report summary available.", 220)}
                      </p>
                    </div>
                    <div className="text-sm text-slate-500">
                      Updated {formatRelativeDate(report.updatedAt)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
