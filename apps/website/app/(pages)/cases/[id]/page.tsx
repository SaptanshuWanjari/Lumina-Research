import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CirclePause,
  FolderKanban,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../../../Components/Layout/DashboardLayout";
import ActionMenu from "@/app/Components/Common/ActionMenu";
import QuerySelect from "@/app/Components/Common/QuerySelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CaseStatus,
  getCasesForDesk,
  normalizeDeskLabel,
} from "@/lib/mock-cases";

const STATUS_META: Record<
  CaseStatus,
  { label: string; chipClass: string; icon: ComponentType<{ className?: string }> }
> = {
  active: {
    label: "ACTIVE",
    chipClass: "bg-sky-100 text-sky-800",
    icon: PlayCircle,
  },
  processing: {
    label: "PROCESSING",
    chipClass: "bg-amber-100 text-amber-800",
    icon: Activity,
  },
  urgent: {
    label: "URGENT",
    chipClass: "bg-rose-100 text-rose-800",
    icon: AlertTriangle,
  },
  paused: {
    label: "PAUSED",
    chipClass: "bg-slate-200 text-slate-700",
    icon: CirclePause,
  },
};

const FILTERS = ["all", "active", "processing", "urgent", "paused"] as const;
type FilterValue = (typeof FILTERS)[number];
const SORT_OPTIONS = [
  { label: "Sort: Latest Activity", value: "recent" },
  { label: "Sort: Title", value: "title" },
  { label: "Sort: Status", value: "status" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function normalizeFilter(value?: string | string[]): FilterValue {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed && FILTERS.includes(parsed as FilterValue)) {
    return parsed as FilterValue;
  }
  return "all";
}

function normalizeSort(value?: string | string[]): SortValue {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed === "recent" || parsed === "title" || parsed === "status") {
    return parsed;
  }
  return "recent";
}

export async function generateMetadata(
  props: PageProps<"/cases/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  return {
    title: `${normalizeDeskLabel(id)} Cases`,
  };
}

export default async function CasesDeskPage(
  props: PageProps<"/cases/[id]">
) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const filter = normalizeFilter(query.status);
  const sort = normalizeSort(query.sort);
  const rawSearchQuery = (Array.isArray(query.q) ? query.q[0] : query.q)?.trim() ?? "";
  const searchQuery = rawSearchQuery.toLowerCase();

  const baseCases = getCasesForDesk(id);
  const filteredByStatus =
    filter === "all"
      ? baseCases
      : baseCases.filter((item) => item.status === filter);
  const filteredCases = filteredByStatus
    .filter((item) =>
      searchQuery.length === 0
        ? true
        : `${item.title} ${item.project}`.toLowerCase().includes(searchQuery)
    )
    .toSorted((left, right) => {
      if (sort === "title") return left.title.localeCompare(right.title);
      if (sort === "status") return left.status.localeCompare(right.status);
      return 0;
    });

  const activeCount = baseCases.filter((item) => item.status === "active").length;
  const processingCount = baseCases.filter(
    (item) => item.status === "processing"
  ).length;

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto grid max-w-[1320px] gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,1fr)]">
          <div className="space-y-6">
            <header className="rounded-[28px] bg-gradient-to-br from-white to-slate-100 p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                    CASE DESK
                  </p>
                  <h1 className="mt-1 text-4xl font-semibold text-slate-900">
                    {normalizeDeskLabel(id)} Cases
                  </h1>
                  <p className="mt-2 text-slate-600">
                    Manage active investigations, triage urgent findings, and
                    monitor updates from your analysis runs.
                  </p>
                </div>

                <Button className="h-11 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800">
                  + New Case
                </Button>
              </div>

              <div className="mt-5 rounded-[22px] bg-white/70 p-3 ring-1 ring-black/5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <form className="flex flex-1 items-center gap-2" action={`/cases/${id}`}>
                    <Input
                      name="q"
                      defaultValue={rawSearchQuery}
                      placeholder="Search cases..."
                      className="h-10 rounded-full border-slate-200 bg-white"
                    />
                    <input type="hidden" name="status" value={filter} />
                    <input type="hidden" name="sort" value={sort} />
                    <Button variant="outline" className="h-10 rounded-full px-4">
                      Search
                    </Button>
                  </form>

                  <div className="flex flex-wrap items-center gap-2">
                    {FILTERS.map((value) => {
                      const isActive = filter === value;
                      const href =
                        value === "all"
                          ? `/cases/${id}?sort=${sort}${rawSearchQuery ? `&q=${encodeURIComponent(rawSearchQuery)}` : ""}`
                          : `/cases/${id}?status=${value}&sort=${sort}${rawSearchQuery ? `&q=${encodeURIComponent(rawSearchQuery)}` : ""}`;

                      return (
                        <Link
                          key={value}
                          href={href}
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                            isActive
                              ? "bg-slate-900 text-white"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {value.toUpperCase()}
                        </Link>
                      );
                    })}
                    <QuerySelect
                      queryKey="sort"
                      value={sort}
                      basePath={`/cases/${id}`}
                      options={SORT_OPTIONS.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                    />
                  </div>
                </div>
              </div>
            </header>

            <section className="rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
                  <FolderKanban className="size-5 text-slate-500" />
                  <h2 className="text-lg font-semibold text-slate-800">
                    Cases List
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  Showing {filteredCases.length} of {baseCases.length}
                </p>
              </div>

              <div className="hidden grid-cols-[1.6fr_140px_180px_110px] gap-4 border-b border-slate-200 px-6 py-3 text-xs font-semibold tracking-[0.16em] text-slate-500 md:grid">
                <div>CASE DETAILS</div>
                <div>STATUS</div>
                <div>LAST ACTIVITY</div>
                <div>ACTIONS</div>
              </div>

              <ul className="divide-y divide-slate-100">
                {filteredCases.map((caseItem) => {
                  const StatusIcon = STATUS_META[caseItem.status].icon;

                  return (
                    <li
                      key={caseItem.id}
                      className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[1.6fr_140px_180px_110px] md:gap-4 md:px-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                          <StatusIcon className="size-4 text-slate-700" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold leading-tight text-slate-800">
                            {caseItem.title}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {caseItem.project}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Badge
                          className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${STATUS_META[caseItem.status].chipClass}`}
                        >
                          {STATUS_META[caseItem.status].label}
                        </Badge>
                      </div>

                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-semibold text-slate-700">
                          {caseItem.updatedAt}
                        </p>
                        <p className="text-xs text-slate-500">{caseItem.note}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/cases/${caseItem.id}/details`}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                        >
                          <ArrowUpRight className="size-4" />
                        </Link>
                        <ActionMenu
                          items={[
                            {
                              label: "Open case",
                              href: `/cases/${caseItem.id}/details`,
                            },
                            {
                              label: "Open latest run",
                              href: "/runs/rr-9942-x",
                            },
                            {
                              label: "View report",
                              href: "/report/fintech-uk-entry/overview",
                            },
                          ]}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[28px] bg-[#d9e7f5] p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <Sparkles className="size-5 text-slate-700" />
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-600">
                  DESK SNAPSHOT
                </p>
              </div>
              <p className="mt-4 text-5xl font-semibold text-slate-800">12</p>
              <p className="mt-1 text-sm text-slate-600">active research threads</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Recent case activity, source intake, and review pressure across
                the current desk.
              </p>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                CASE PRESSURE
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-800">
                      Active Cases
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{activeCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-800">
                      Processing
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{processingCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-800">
                      Urgent Review
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {baseCases.filter((item) => item.status === "urgent").length} flagged cases
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-5">
                <h4 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  NEXT FOCUS
                </h4>
                <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  Review urgent alerts first, then reopen paused cases whose
                  source intake is already complete.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}
