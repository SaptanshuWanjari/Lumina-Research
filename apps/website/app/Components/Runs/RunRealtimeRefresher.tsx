"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAppRealtime } from "@/app/Components/Providers/AppRealtimeProvider";

export function RunRealtimeRefresher({ runId }: { runId: string }) {
  const { runUpdates } = useAppRealtime();
  const router = useRouter();
  const lastSignature = useRef<string | null>(null);
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const update = runUpdates[runId];
    if (!update) return;

    const signature = `${update.status}|${update.currentStep ?? ""}|${update.needsReview ?? ""}`;
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

  return null;
}
