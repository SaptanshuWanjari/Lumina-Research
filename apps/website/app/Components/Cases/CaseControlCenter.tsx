import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CircleAlert,
  CircleDashed,
  Clock3,
  FileCheck2,
  FileSearch,
  ShieldCheck,
} from "lucide-react";

import type { CaseDetailRecord } from "@/lib/data/mock-cases";
import { appRoutes } from "@/lib/data/mock-app";

interface CaseControlCenterProps {
  entry: CaseDetailRecord;
  caseId: string;
}

export default function CaseControlCenter({ entry, caseId }: CaseControlCenterProps) {
  const indexedCount = entry.sources.filter((item) => item.status === "indexed").length;
  const ingestingCount = entry.sources.filter((item) => item.status === "ingesting").length;
  const failedCount = entry.sources.filter((item) => item.status === "failed").length;
  const latestRunId = entry.runs[0]?.id ?? "rr-9942-x";
  const failedSourceId = entry.sources.find((source) => source.status === "failed")?.sourceId;

  return (
    <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-xs font-semibold tracking-[0.16em] text-slate-500">CASE CONTROL CENTER</h3>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">RUN HEALTH</p>
        <ul className="mt-3 space-y-3">
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <Clock3 className="size-4 text-slate-500" />
            Last run: {entry.runs[0]?.startedAt}
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <Activity className="size-4 text-slate-500" />
            Active execution checkpoints enabled
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <ShieldCheck className="size-4 text-slate-500" />
            Citation confidence threshold: 0.82
          </li>
        </ul>
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">QUICK ACTIONS</p>
        <div className="mt-3 space-y-2">
          <Link
            href={`/runs/${latestRunId}`}
            className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Open latest run <ArrowUpRight className="size-4" />
          </Link>
          <Link
            href={failedSourceId ? `/cases/${caseId}/sources/${failedSourceId}` : `/cases/${caseId}/details?tab=sources`}
            className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Review failed source <CircleAlert className="size-4" />
          </Link>
          <Link
            href={appRoutes.reportOverview}
            className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Open report draft <FileCheck2 className="size-4" />
          </Link>
        </div>
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">SOURCE SIGNALS</p>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <FileSearch className="size-4 text-slate-500" />
            {indexedCount} indexed sources used in latest synthesis
          </p>
          <p className="flex items-center gap-2">
            <CircleDashed className="size-4 text-slate-500" />
            {ingestingCount} source ingesting
          </p>
          <p className="flex items-center gap-2">
            <CircleAlert className="size-4 text-slate-500" />
            {failedCount} source requires manual review
          </p>
        </div>
      </div>
    </section>
  );
}
