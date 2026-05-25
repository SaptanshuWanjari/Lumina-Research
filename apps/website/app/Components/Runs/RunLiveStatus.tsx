"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { useAppRealtime } from "@/app/Components/Providers/AppRealtimeProvider";

const STATUS_CLASS: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  running: "bg-sky-100 text-sky-800",
  needs_review: "bg-amber-100 text-amber-800",
  resuming: "bg-blue-100 text-blue-800",
  complete: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-700",
};

export function RunLiveStatus({
  runId,
  initialStatus,
  initialCurrentStep,
}: {
  runId: string;
  initialStatus: string;
  initialCurrentStep: string | null;
}) {
  const router = useRouter();
  const { connected, runUpdates } = useAppRealtime();
  const update = runUpdates[runId];
  const status = update?.status ?? initialStatus;
  const currentStep = update?.currentStep ?? initialCurrentStep;

  useEffect(() => {
    if (!update) return;
    router.refresh();
  }, [router, update]);

  return (
    <div className="mt-3 rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* <Badge className={STATUS_CLASS[status] ?? "bg-slate-100 text-slate-700"}> */}
        {/*   {status} */}
        {/* </Badge> */}
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
          {connected ? "Live updates on" : "Waiting for live updates"}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        Current step:{" "}
        <span className="font-semibold text-slate-950">
          {currentStep ?? "queued"}
        </span>
      </p>
    </div>
  );
}
