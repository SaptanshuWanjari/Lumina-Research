import type { CaseDetailRecord } from "@/lib/data/mock-cases";

interface CaseDetailStatsProps {
  stats: CaseDetailRecord["stats"];
}

export default function CaseDetailStats({ stats }: CaseDetailStatsProps) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="rounded-[13px] bg-white/80 p-3">
        <p className="text-xs tracking-widest text-slate-500">SOURCES</p>
        <p className="mt-1 text-xl font-semibold text-slate-800">{stats.sources}</p>
      </div>
      <div className="rounded-[13px] bg-white/80 p-3">
        <p className="text-xs tracking-widest text-slate-500">RUNS</p>
        <p className="mt-1 text-xl font-semibold text-slate-800">{stats.runs}</p>
      </div>
      <div className="rounded-[13px] bg-white/80 p-3">
        <p className="text-xs tracking-widest text-slate-500">CITATIONS</p>
        <p className="mt-1 text-xl font-semibold text-slate-800">{stats.citations}</p>
      </div>
      <div className="rounded-[13px] bg-white/80 p-3">
        <p className="text-xs tracking-widest text-slate-500">LAST PUBLISHED</p>
        <p className="mt-1 text-xl font-semibold text-slate-800">{stats.lastPublished}</p>
      </div>
    </div>
  );
}
