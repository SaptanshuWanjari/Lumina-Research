import Link from "next/link";

import CompareRunsDialog from "@/app/Components/Dialogs/CompareRunsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CaseRunSummary } from "@/lib/data/mock-cases";
import { appRoutes } from "@/lib/data/mock-app";

interface CaseRunsPanelProps {
  runs: CaseRunSummary[];
}

function runStatusClass(status: CaseRunSummary["status"]) {
  if (status === "queued") return "bg-slate-200 text-slate-700";
  if (status === "running") return "bg-sky-100 text-sky-800";
  if (status === "needs_review") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

export default function CaseRunsPanel({ runs }: CaseRunsPanelProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between rounded-[13px] bg-white p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-slate-800">Run History</h2>
        <div className="flex items-center gap-2">
          <Button asChild className="h-9 rounded-full bg-slate-900 px-4 text-xs text-white hover:bg-slate-800">
            <Link href={appRoutes.runDetail}>View Latest Run</Link>
          </Button>
          <CompareRunsDialog runs={runs} />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {runs.map((run) => (
          <article key={run.id} className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-slate-800">{run.label}</p>
              <Badge
                className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${runStatusClass(
                  run.status
                )}`}
              >
                {run.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Started {run.startedAt} · Duration {run.duration}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-700"
                style={{ width: `${run.stepsCompleted}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Steps completed: {run.stepsCompleted}%</p>
            <div className="mt-4 flex items-center gap-2">
              <Button asChild variant="outline" className="h-8 rounded-full px-3 text-xs">
                <Link href={`/runs/${run.id}`}>View Run</Link>
              </Button>
              {run.status === "needs_review" ? (
                <Button asChild className="h-8 rounded-full bg-slate-900 px-3 text-xs text-white hover:bg-slate-800">
                  <Link href={appRoutes.reportOverview}>Review Draft</Link>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
