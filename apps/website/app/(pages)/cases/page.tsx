import Link from "next/link";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { CreateCaseButton } from "@/app/Components/Cases/CreateCaseButton";
import { Badge } from "@/components/ui/badge";
import { listCases } from "@/lib/server/data";
import { formatRelativeDate, truncateText } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  ingesting: "bg-amber-100 text-amber-800",
  indexed: "bg-emerald-100 text-emerald-800",
  analyzing: "bg-sky-100 text-sky-800",
  review: "bg-orange-100 text-orange-800",
  published: "bg-violet-100 text-violet-800",
  failed: "bg-rose-100 text-rose-800",
};

export default async function CasesPage(props: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const query = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q)?.trim().toLowerCase() ?? "";
  const status = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const allCases = await listCases();
  const cases = allCases.filter((caseItem) => {
    const matchesQuery =
      !query ||
      `${caseItem.title} ${caseItem.question ?? ""} ${caseItem.tags.join(" ")}`
        .toLowerCase()
        .includes(query);
    const matchesStatus = !status || status === "all" || caseItem.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold text-slate-900">Cases</h1>
              </div>
              <CreateCaseButton className="rounded-full px-6" showIcon={true} />
            </div>
            <form className="mt-5 flex flex-wrap gap-3" action="/cases">
              <input
                name="q"
                defaultValue={query}
                placeholder="Search cases"
                className="h-10 min-w-70 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm"
              />
              <select
                name="status"
                defaultValue={status ?? "all"}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="ingesting">Ingesting</option>
                <option value="indexed">Indexed</option>
                <option value="analyzing">Analyzing</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
              <button className="h-10 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white">
                Filter
              </button>
            </form>
          </header>

          <div className="space-y-3">
            {cases.length === 0 ? (
              <div className="rounded-[13px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-600">
                No cases match the current filter.
              </div>
            ) : (
              cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}/details`}
                  className="block rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-slate-900">
                          {caseItem.title}
                        </h2>
                        <Badge className={STATUS_CLASS[caseItem.status] ?? "bg-slate-100 text-slate-700"}>
                          {caseItem.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {truncateText(caseItem.question ?? caseItem.summary ?? "No case question set.", 180)}
                      </p>
                      {caseItem.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {caseItem.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm text-slate-500">
                      Updated {formatRelativeDate(caseItem.updatedAt)}
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
