import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export type SourceRealtimeUpdate = {
  id: string;
  status: string;
  errorMessage?: string | null;
};

export type RunRealtimeUpdate = {
  id: string;
  status: string;
  currentStep?: string | null;
  needsReview?: boolean | null;
  errorMessage?: string | null;
};

export type ReportRealtimeUpdate = {
  id: string;
  status: string;
  publishedAt?: string | null;
};

interface RealtimeHandlers {
  onSource?: (update: SourceRealtimeUpdate) => void;
  onRun?: (update: RunRealtimeUpdate) => void;
  onReport?: (update: ReportRealtimeUpdate) => void;
}

function mapSource(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
  const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? "unknown"),
    errorMessage:
      typeof row.error_message === "string" ? row.error_message : null,
  } satisfies SourceRealtimeUpdate;
}

function mapRun(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
  const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? "unknown"),
    currentStep:
      typeof row.current_step === "string" ? row.current_step : null,
    needsReview:
      typeof row.needs_review === "boolean" ? row.needs_review : null,
    errorMessage:
      typeof row.error_message === "string" ? row.error_message : null,
  } satisfies RunRealtimeUpdate;
}

function mapReport(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
  const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? "unknown"),
    publishedAt:
      typeof row.published_at === "string" ? row.published_at : null,
  } satisfies ReportRealtimeUpdate;
}

export function subscribeToResearchRealtime(handlers: RealtimeHandlers) {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel("research-workspace-status")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sources" },
      (payload) => handlers.onSource?.(mapSource(payload))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "runs" },
      (payload) => handlers.onRun?.(mapRun(payload))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "report_versions" },
      (payload) => handlers.onReport?.(mapReport(payload))
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
