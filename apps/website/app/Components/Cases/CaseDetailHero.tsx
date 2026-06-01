import AddSourceDialog from "@/app/Components/Dialogs/AddSourceDialog";
import RunConfigDialog from "@/app/Components/Dialogs/RunConfigDialog";
import StatusChip from "@/app/Components/Common/StatusChip";
import type { CaseDetailRecord } from "@/lib/data/mock-cases";

interface CaseDetailHeroProps {
  entry: CaseDetailRecord;
}

export default function CaseDetailHero({ entry }: CaseDetailHeroProps) {
  return (
    <header className="rounded-[13px] bg-gradient-to-br from-[#dbeaf8] to-[#cddff1] p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <StatusChip tone="info" className="bg-slate-900 text-white">
            {entry.status}
          </StatusChip>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-2 max-w-3xl text-slate-700">{entry.prompt}</p>
        </div>

        <div className="flex gap-2">
          <RunConfigDialog
            caseId={entry.id}
            triggerClassName="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          />
          <AddSourceDialog triggerClassName="h-10 rounded-full border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800" />
        </div>
      </div>
    </header>
  );
}
