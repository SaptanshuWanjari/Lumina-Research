import RunConfigDialog from "@/app/Components/Dialogs/RunConfigDialog";

export function StartRunButton({ caseId }: { caseId: string }) {
  return (
    <RunConfigDialog
      caseId={caseId}
      triggerLabel="Start Run"
      triggerClassName="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
    />
  );
}
