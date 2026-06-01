import "server-only";

import { requireUserContext } from "@/lib/server/auth";

type JsonObject = Record<string, unknown>;

export type MeSummary = {
  id: string;
  email: string | null;
  displayName: string;
  initials: string;
};

export type CaseSummary = {
  id: string;
  title: string;
  question: string | null;
  summary: string | null;
  status: string;
  priority: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastRunAt: string | null;
  lastPublishedAt: string | null;
};

export type SourceSummary = {
  id: string;
  caseId: string;
  sourceType: string;
  title: string;
  status: string;
  url: string | null;
  storagePath: string | null;
  contentHash: string | null;
  noteText: string | null;
  errorMessage: string | null;
  metadata: JsonObject;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RunSummary = {
  id: string;
  caseId: string;
  status: string;
  currentStep: string | null;
  needsReview: boolean;
  reviewSummary: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RunStepSummary = {
  id: string;
  stepKey: string;
  stepOrder: number;
  status: string;
  goal: string | null;
  inputJson: JsonObject | null;
  outputJson: JsonObject | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
};

export type RunArtifactSummary = {
  id: string;
  artifactType: string;
  title: string | null;
  payloadJson: JsonObject | null;
  createdAt: string;
};

export type ReportSummary = {
  id: string;
  caseId: string;
  runId: string | null;
  versionNumber: number;
  status: string;
  title: string | null;
  summary: string | null;
  contentMarkdown: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};


export type SourceChunkSummary = {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  createdAt: string;
};

export type IngestionAttemptSummary = {
  id: string;
  attemptNo: number;
  status: string;
  stage: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

export type CaseDetail = {
  caseItem: CaseSummary;
  sources: SourceSummary[];
  runs: RunSummary[];
  reports: ReportSummary[];
};

export type SourceDetail = {
  source: SourceSummary;
  chunks: SourceChunkSummary[];
  attempts: IngestionAttemptSummary[];
};

export type RunDetail = {
  run: RunSummary;
  caseItem: CaseSummary;
  steps: RunStepSummary[];
  artifacts: RunArtifactSummary[];
  reports: ReportSummary[];
};

export type ReportDetail = {
  report: ReportSummary;
  caseItem: CaseSummary;
};

export type DashboardData = {
  me: MeSummary;
  counts: {
    totalCases: number;
    indexedSources: number;
    reviewRuns: number;
    publishedReports: number;
  };
  recentCases: CaseSummary[];
  reviewRuns: RunSummary[];
  recentReports: ReportSummary[];
};

export type SearchResult =
  | {
      kind: "case";
      id: string;
      title: string;
      description: string;
      href: string;
      updatedAt: string;
    }
  | {
      kind: "source";
      id: string;
      title: string;
      description: string;
      href: string;
      updatedAt: string;
    }
  | {
      kind: "report";
      id: string;
      title: string;
      description: string;
      href: string;
      updatedAt: string;
    };

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function objectValue(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function listValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function displayNameFromEmail(email: string | null) {
  if (!email) return "Analyst";
  return email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Analyst";
}

function initialsFromName(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || "AN";
}

function formatSourceTitle(row: Record<string, unknown>) {
  if (typeof row.title === "string" && row.title.trim()) return row.title;

  const metadata = objectValue(row.metadata_json);
  const filename = metadata.filename;
  if (typeof filename === "string" && filename.trim()) return filename;

  if (typeof row.url === "string" && row.url.trim()) return row.url;

  if (typeof row.note_text === "string" && row.note_text.trim()) {
    return row.note_text.slice(0, 80);
  }

  return "Untitled source";
}

function mapCase(row: Record<string, unknown>): CaseSummary {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? "Untitled case"),
    question: stringValue(row.question),
    summary: stringValue(row.summary),
    status: String(row.status ?? "draft"),
    priority: String(row.priority ?? "normal"),
    tags: listValue(row.tags),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    lastRunAt: stringValue(row.last_run_at),
    lastPublishedAt: stringValue(row.last_published_at),
  };
}

function mapSource(row: Record<string, unknown>): SourceSummary {
  return {
    id: String(row.id ?? ""),
    caseId: String(row.case_id ?? ""),
    sourceType: String(row.source_type ?? "note"),
    title: formatSourceTitle(row),
    status: String(row.status ?? "pending"),
    url: stringValue(row.url),
    storagePath: stringValue(row.storage_path),
    contentHash: stringValue(row.content_hash),
    noteText: stringValue(row.note_text),
    errorMessage: stringValue(row.error_message),
    metadata: objectValue(row.metadata_json),
    createdAt: stringValue(row.created_at),
    updatedAt: stringValue(row.updated_at),
  };
}

function mapRun(row: Record<string, unknown>): RunSummary {
  return {
    id: String(row.id ?? ""),
    caseId: String(row.case_id ?? ""),
    status: String(row.status ?? "queued"),
    currentStep: stringValue(row.current_step),
    needsReview: booleanValue(row.needs_review),
    reviewSummary: stringValue(row.review_summary),
    errorMessage: stringValue(row.error_message),
    startedAt: stringValue(row.started_at),
    completedAt: stringValue(row.completed_at),
    durationMs: numberValue(row.duration_ms),
    createdAt: stringValue(row.created_at),
    updatedAt: stringValue(row.updated_at),
  };
}

function mapReport(row: Record<string, unknown>): ReportSummary {
  return {
    id: String(row.id ?? ""),
    caseId: String(row.case_id ?? ""),
    runId: stringValue(row.run_id),
    versionNumber: Number(row.version_number ?? 1),
    status: String(row.status ?? "draft"),
    title: stringValue(row.title),
    summary: stringValue(row.summary),
    contentMarkdown: stringValue(row.content_markdown),
    publishedAt: stringValue(row.published_at),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapRunStep(row: Record<string, unknown>): RunStepSummary {
  return {
    id: String(row.id ?? ""),
    stepKey: String(row.step_key ?? ""),
    stepOrder: Number(row.step_order ?? 0),
    status: String(row.status ?? "queued"),
    goal: stringValue(row.goal),
    inputJson: objectValue(row.input_json),
    outputJson: objectValue(row.output_json),
    errorMessage: stringValue(row.error_message),
    startedAt: stringValue(row.started_at),
    completedAt: stringValue(row.completed_at),
    durationMs: numberValue(row.duration_ms),
  };
}

function mapArtifact(row: Record<string, unknown>): RunArtifactSummary {
  return {
    id: String(row.id ?? ""),
    artifactType: String(row.artifact_type ?? "other"),
    title: stringValue(row.title),
    payloadJson: objectValue(row.payload_json),
    createdAt: String(row.created_at ?? ""),
  };
}


function mapChunk(row: Record<string, unknown>): SourceChunkSummary {
  return {
    id: String(row.id ?? ""),
    chunkIndex: Number(row.chunk_index ?? 0),
    content: String(row.content ?? ""),
    tokenCount: numberValue(row.token_count),
    createdAt: String(row.created_at ?? ""),
  };
}

function mapAttempt(row: Record<string, unknown>): IngestionAttemptSummary {
  return {
    id: String(row.id ?? ""),
    attemptNo: Number(row.attempt_no ?? 0),
    status: String(row.status ?? "queued"),
    stage: stringValue(row.stage),
    errorMessage: stringValue(row.error_message),
    startedAt: stringValue(row.started_at),
    finishedAt: stringValue(row.finished_at),
    createdAt: String(row.created_at ?? ""),
  };
}

async function getUserScopedClient() {
  const context = await requireUserContext();
  return context;
}

export async function getMeSummary(): Promise<MeSummary> {
  const { supabase, user } = await getUserScopedClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const displayName =
    (profile && typeof profile.display_name === "string" && profile.display_name) ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null) ||
    displayNameFromEmail(user.email);

  return {
    id: user.id,
    email: user.email,
    displayName,
    initials: initialsFromName(displayName),
  };
}

export async function listCases() {
  const { supabase, user } = await getUserScopedClient();
  const { data, error } = await supabase
    .from("cases")
    .select(
      "id,title,question,summary,status,priority,tags,created_at,updated_at,last_run_at,last_published_at",
    )
    .eq("owner_user_id", user.id)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapCase(row as Record<string, unknown>));
}

export async function getCaseDetail(caseId: string): Promise<CaseDetail | null> {
  const { supabase, user } = await getUserScopedClient();
  const [caseResp, sourcesResp, runsResp, reportsResp] = await Promise.all([
    supabase
      .from("cases")
      .select(
        "id,title,question,summary,status,priority,tags,created_at,updated_at,last_run_at,last_published_at",
      )
      .eq("id", caseId)
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("sources")
      .select(
        "id,case_id,source_type,title,url,storage_path,note_text,status,error_message,content_hash,metadata_json,created_at,updated_at",
      )
      .eq("case_id", caseId)
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("runs")
      .select(
        "id,case_id,status,current_step,needs_review,review_summary,error_message,started_at,completed_at,duration_ms,created_at,updated_at",
      )
      .eq("case_id", caseId)
      .eq("owner_user_id", user.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("report_versions")
      .select(
        "id,case_id,run_id,version_number,status,title,summary,content_markdown,published_at,created_at,updated_at",
      )
      .eq("case_id", caseId)
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (caseResp.error) throw caseResp.error;
  if (!caseResp.data) return null;
  if (sourcesResp.error) throw sourcesResp.error;
  if (runsResp.error) throw runsResp.error;
  if (reportsResp.error) throw reportsResp.error;

  return {
    caseItem: mapCase(caseResp.data as Record<string, unknown>),
    sources: (sourcesResp.data ?? []).map((row) =>
      mapSource(row as Record<string, unknown>),
    ),
    runs: (runsResp.data ?? []).map((row) => mapRun(row as Record<string, unknown>)),
    reports: (reportsResp.data ?? []).map((row) =>
      mapReport(row as Record<string, unknown>),
    ),
  };
}

export async function getSourceDetail(
  caseId: string,
  sourceId: string,
): Promise<SourceDetail | null> {
  const { supabase, user } = await getUserScopedClient();
  const sourceResp = await supabase
    .from("sources")
    .select(
      "id,case_id,source_type,title,url,storage_path,note_text,status,error_message,content_hash,metadata_json,created_at,updated_at",
    )
    .eq("id", sourceId)
    .eq("case_id", caseId)
    .eq("owner_user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();

  if (sourceResp.error) throw sourceResp.error;
  if (!sourceResp.data) return null;

  const documentsResp = await supabase
    .from("documents")
    .select("id")
    .eq("source_id", sourceId)
    .eq("case_id", caseId)
    .eq("owner_user_id", user.id)
    .order("version", { ascending: false });

  if (documentsResp.error) throw documentsResp.error;

  const documentIds = (documentsResp.data ?? [])
    .map((row) => String((row as Record<string, unknown>).id ?? ""))
    .filter(Boolean);

  const [chunksResp, attemptsResp] = await Promise.all([
    documentIds.length
      ? supabase
          .from("chunks")
          .select("id,chunk_index,content,token_count,created_at")
          .in("document_id", documentIds)
          .eq("case_id", caseId)
          .eq("owner_user_id", user.id)
          .order("chunk_index", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("ingestion_attempts")
      .select(
        "id,attempt_no,status,stage,error_message,started_at,finished_at,created_at",
      )
      .eq("source_id", sourceId)
      .eq("case_id", caseId)
      .eq("owner_user_id", user.id)
      .order("attempt_no", { ascending: false }),
  ]);

  if (chunksResp.error) throw chunksResp.error;
  if (attemptsResp.error) throw attemptsResp.error;

  return {
    source: mapSource(sourceResp.data as Record<string, unknown>),
    chunks: (chunksResp.data ?? []).map((row) =>
      mapChunk(row as Record<string, unknown>),
    ),
    attempts: (attemptsResp.data ?? []).map((row) =>
      mapAttempt(row as Record<string, unknown>),
    ),
  };
}

export async function getRunDetail(runId: string): Promise<RunDetail | null> {
  const { supabase, user } = await getUserScopedClient();
  const runResp = await supabase
    .from("runs")
    .select(
      "id,case_id,status,current_step,needs_review,review_summary,error_message,started_at,completed_at,duration_ms,created_at,updated_at",
    )
    .eq("id", runId)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (runResp.error) throw runResp.error;
  if (!runResp.data) return null;

  const run = mapRun(runResp.data as Record<string, unknown>);
  const [caseResp, stepsResp, artifactsResp, reportsResp] = await Promise.all([
    supabase
      .from("cases")
      .select(
        "id,title,question,summary,status,priority,tags,created_at,updated_at,last_run_at,last_published_at",
      )
      .eq("id", run.caseId)
      .eq("owner_user_id", user.id)
      .maybeSingle(),
    supabase
      .from("run_steps")
      .select(
        "id,step_key,step_order,status,goal,input_json,output_json,error_message,started_at,completed_at,duration_ms",
      )
      .eq("run_id", runId)
      .eq("owner_user_id", user.id)
      .order("step_order", { ascending: true }),
    supabase
      .from("run_artifacts")
      .select("id,artifact_type,title,payload_json,created_at")
      .eq("run_id", runId)
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("report_versions")
      .select(
        "id,case_id,run_id,version_number,status,title,summary,content_markdown,published_at,created_at,updated_at",
      )
      .eq("run_id", runId)
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .order("version_number", { ascending: false }),
  ]);

  if (caseResp.error) throw caseResp.error;
  if (!caseResp.data) return null;
  if (stepsResp.error) throw stepsResp.error;
  if (artifactsResp.error) throw artifactsResp.error;
  if (reportsResp.error) throw reportsResp.error;

  return {
    run,
    caseItem: mapCase(caseResp.data as Record<string, unknown>),
    steps: (stepsResp.data ?? []).map((row) =>
      mapRunStep(row as Record<string, unknown>),
    ),
    artifacts: (artifactsResp.data ?? []).map((row) =>
      mapArtifact(row as Record<string, unknown>),
    ),
    reports: (reportsResp.data ?? []).map((row) =>
      mapReport(row as Record<string, unknown>),
    ),
  };
}

export async function listReports() {
  const { supabase, user } = await getUserScopedClient();
  const { data, error } = await supabase
    .from("report_versions")
    .select(
      "id,case_id,run_id,version_number,status,title,summary,content_markdown,published_at,created_at,updated_at",
    )
    .eq("owner_user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapReport(row as Record<string, unknown>));
}

export async function getReportDetail(reportId: string): Promise<ReportDetail | null> {
  const { supabase, user } = await getUserScopedClient();
  const reportResp = await supabase
    .from("report_versions")
    .select(
      "id,case_id,run_id,version_number,status,title,summary,content_markdown,published_at,created_at,updated_at",
    )
    .eq("id", reportId)
    .eq("owner_user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();

  if (reportResp.error) throw reportResp.error;
  if (!reportResp.data) return null;

  const report = mapReport(reportResp.data as Record<string, unknown>);
  const [caseResp] = await Promise.all([
    supabase
      .from("cases")
      .select(
        "id,title,question,summary,status,priority,tags,created_at,updated_at,last_run_at,last_published_at",
      )
      .eq("id", report.caseId)
      .eq("owner_user_id", user.id)
      .maybeSingle(),
  ]);

  if (caseResp.error) throw caseResp.error;
  if (!caseResp.data) return null;

  return {
    report,
    caseItem: mapCase(caseResp.data as Record<string, unknown>),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const { supabase, user } = await getUserScopedClient();
  const me = await getMeSummary();
  const [
    casesCountResp,
    sourcesCountResp,
    runsCountResp,
    reportsCountResp,
    recentCasesResp,
    reviewRunsResp,
    recentReportsResp,
  ] = await Promise.all([
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .is("archived_at", null),
    supabase
      .from("sources")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .eq("status", "indexed")
      .is("archived_at", null),
    supabase
      .from("runs")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .eq("needs_review", true),
    supabase
      .from("report_versions")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .eq("status", "published")
      .is("archived_at", null),
    supabase
      .from("cases")
      .select(
        "id,title,question,summary,status,priority,tags,created_at,updated_at,last_run_at,last_published_at",
      )
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("runs")
      .select(
        "id,case_id,status,current_step,needs_review,review_summary,error_message,started_at,completed_at,duration_ms,created_at,updated_at",
      )
      .eq("owner_user_id", user.id)
      .eq("needs_review", true)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("report_versions")
      .select(
        "id,case_id,run_id,version_number,status,title,summary,content_markdown,published_at,created_at,updated_at",
      )
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  if (casesCountResp.error) throw casesCountResp.error;
  if (sourcesCountResp.error) throw sourcesCountResp.error;
  if (runsCountResp.error) throw runsCountResp.error;
  if (reportsCountResp.error) throw reportsCountResp.error;
  if (recentCasesResp.error) throw recentCasesResp.error;
  if (reviewRunsResp.error) throw reviewRunsResp.error;
  if (recentReportsResp.error) throw recentReportsResp.error;

  return {
    me,
    counts: {
      totalCases: casesCountResp.count ?? 0,
      indexedSources: sourcesCountResp.count ?? 0,
      reviewRuns: runsCountResp.count ?? 0,
      publishedReports: reportsCountResp.count ?? 0,
    },
    recentCases: (recentCasesResp.data ?? []).map((row) =>
      mapCase(row as Record<string, unknown>),
    ),
    reviewRuns: (reviewRunsResp.data ?? []).map((row) =>
      mapRun(row as Record<string, unknown>),
    ),
    recentReports: (recentReportsResp.data ?? []).map((row) =>
      mapReport(row as Record<string, unknown>),
    ),
  };
}

export async function searchWorkspace(query: string): Promise<SearchResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const { supabase, user } = await getUserScopedClient();
  const like = `%${normalizedQuery}%`;

  const [casesResp, sourcesResp, reportsResp] = await Promise.all([
    supabase
      .from("cases")
      .select("id,title,question,updated_at")
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .or(`title.ilike.${like},question.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("sources")
      .select("id,case_id,title,url,note_text,metadata_json,updated_at")
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .or(`title.ilike.${like},url.ilike.${like},note_text.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("report_versions")
      .select("id,case_id,title,summary,updated_at")
      .eq("owner_user_id", user.id)
      .is("archived_at", null)
      .or(`title.ilike.${like},summary.ilike.${like},content_markdown.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  if (casesResp.error) throw casesResp.error;
  if (sourcesResp.error) throw sourcesResp.error;
  if (reportsResp.error) throw reportsResp.error;

  const results: SearchResult[] = [];

  for (const row of casesResp.data ?? []) {
    const record = row as Record<string, unknown>;
    results.push({
      kind: "case",
      id: String(record.id ?? ""),
      title: String(record.title ?? "Untitled case"),
      description: stringValue(record.question) ?? "No case question provided.",
      href: `/cases/${record.id}/details`,
      updatedAt: String(record.updated_at ?? ""),
    });
  }

  for (const row of sourcesResp.data ?? []) {
    const record = row as Record<string, unknown>;
    const caseId = String(record.case_id ?? "");
    results.push({
      kind: "source",
      id: String(record.id ?? ""),
      title: formatSourceTitle(record),
      description:
        stringValue(record.url) ??
        stringValue(record.note_text)?.slice(0, 140) ??
        "Indexed source",
      href: `/cases/${caseId}/sources/${record.id}`,
      updatedAt: String(record.updated_at ?? ""),
    });
  }

  for (const row of reportsResp.data ?? []) {
    const record = row as Record<string, unknown>;
    results.push({
      kind: "report",
      id: String(record.id ?? ""),
      title: String(record.title ?? `Report ${record.id ?? ""}`),
      description: stringValue(record.summary) ?? "No report summary available.",
      href: `/report/${record.id}/overview`,
      updatedAt: String(record.updated_at ?? ""),
    });
  }

  return results.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
