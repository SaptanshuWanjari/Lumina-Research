"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  subscribeToResearchRealtime,
  type ReportRealtimeUpdate,
  type RunRealtimeUpdate,
  type SourceRealtimeUpdate,
} from "@/lib/supabase/realtime";

interface AppRealtimeContextValue {
  runUpdates: Record<string, RunRealtimeUpdate>;
  sourceUpdates: Record<string, SourceRealtimeUpdate>;
  reportUpdates: Record<string, ReportRealtimeUpdate>;
  connected: boolean;
}

const AppRealtimeContext = createContext<AppRealtimeContextValue | null>(null);

export function AppRealtimeProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [runUpdates, setRunUpdates] = useState<Record<string, RunRealtimeUpdate>>({});
  const [sourceUpdates, setSourceUpdates] = useState<Record<string, SourceRealtimeUpdate>>({});
  const [reportUpdates, setReportUpdates] = useState<Record<string, ReportRealtimeUpdate>>({});

  useEffect(() => {
    const unsubscribe = subscribeToResearchRealtime({
      onRun: (update) => {
        setConnected(true);
        setRunUpdates((prev) => ({ ...prev, [update.id]: update }));
      },
      onSource: (update) => {
        setConnected(true);
        setSourceUpdates((prev) => ({ ...prev, [update.id]: update }));
      },
      onReport: (update) => {
        setConnected(true);
        setReportUpdates((prev) => ({ ...prev, [update.id]: update }));
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ runUpdates, sourceUpdates, reportUpdates, connected }),
    [runUpdates, sourceUpdates, reportUpdates, connected]
  );

  return <AppRealtimeContext.Provider value={value}>{children}</AppRealtimeContext.Provider>;
}

export function useAppRealtime() {
  const context = useContext(AppRealtimeContext);
  if (!context) {
    throw new Error("useAppRealtime must be used inside AppRealtimeProvider");
  }
  return context;
}
