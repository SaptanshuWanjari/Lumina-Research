import Link from "next/link";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { searchWorkspace } from "@/lib/server/data";
import { formatRelativeDate } from "@/lib/utils";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const query = (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q)?.trim() ?? "";
  const results = query ? await searchWorkspace(query) : [];

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-6 bg-slate-50 p-6">
        <section className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-4xl font-semibold text-slate-900">Search</h1>
          <p className="mt-2 text-slate-600">
            Keyword search across real cases, sources, and report versions.
          </p>
          <form className="mt-5 flex flex-wrap gap-3" action="/search">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search your workspace"
              className="h-11 min-w-[320px] rounded-full border border-slate-200 bg-slate-50 px-4 text-sm"
            />
            <button className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white">
              Search
            </button>
          </form>
        </section>

        {query.length === 0 ? (
          <div className="rounded-[13px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-600">
            Enter a query to search cases, indexed sources, and saved reports.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-[13px] border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-600">
            No results found for &quot;{query}&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <Link
                key={`${result.kind}-${result.id}`}
                href={result.href}
                className="block rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                      {result.kind.toUpperCase()}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {result.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{result.description}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatRelativeDate(result.updatedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
