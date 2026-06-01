"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppRealtime } from "@/app/Components/Providers/AppRealtimeProvider";

export function RunRealtimeRefresher({ runId }: { runId: string }) {
  const { runUpdates } = useAppRealtime();
  const router = useRouter();
  const lastSignature = useRef<string | null>(null);
  const lastRefreshAt = useRef(0);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    const update = runUpdates[runId];
    if (!update) return;

    // Surface error messages immediately without waiting for router.refresh().
    if (update.status === "failed" && update.errorMessage) {
      setInlineError(update.errorMessage);
    } else {
      setInlineError(null);
    }

    const signature = `${update.status}|${update.currentStep ?? ""}|${update.needsReview ?? ""}|${update.errorMessage ?? ""}`;
    if (signature === lastSignature.current) {
      return;
    }

    const now = Date.now();
    if (now - lastRefreshAt.current < 750) {
      return;
    }

    lastSignature.current = signature;
    lastRefreshAt.current = now;
    router.refresh();
  }, [runUpdates, runId, router]);

  if (!inlineError) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 shadow-xl ring-1 ring-rose-100"
    >
      <p className="text-sm font-semibold text-rose-800">Run failed</p>
      <p className="mt-1 text-sm text-rose-700">{inlineError}</p>
    </div>
  );
}
