export type CaseStatus = "active" | "processing" | "urgent" | "paused";
export type CaseDetailStatus = "ANALYZING" | "READY";
export type SourceStatus = "pending" | "ingesting" | "indexed" | "failed";
export type RunStatus = "queued" | "running" | "needs_review" | "complete";

export interface CaseRecord {
  id: string;
  deskId: string;
  title: string;
  project: string;
  status: CaseStatus;
  lastRunStatus: "queued" | "running" | "needs_review" | "complete";
  owner: string;
  updatedAt: string;
  note: string;
}

export interface CaseSourceSummary {
  id: string;
  sourceId: string;
  name: string;
  type: "URL" | "PDF" | "NOTE";
  status: SourceStatus;
  processedAt: string;
}

export interface CaseRunSummary {
  id: string;
  label: string;
  status: RunStatus;
  startedAt: string;
  duration: string;
  stepsCompleted: number;
}

export interface CaseActivityItem {
  id: string;
  text: string;
  at: string;
}

export interface CaseDetailRecord {
  id: string;
  title: string;
  status: CaseDetailStatus;
  prompt: string;
  summary: string;
  createdAt: string;
  tags: string[];
  stats: {
    sources: number;
    runs: number;
    citations: number;
    lastPublished: string;
  };
  goals: string[];
  sources: CaseSourceSummary[];
  runs: CaseRunSummary[];
  activity: CaseActivityItem[];
}

export interface SourceChunk {
  id: string;
  title: string;
  excerpt: string;
  pageRange: string;
  vectorized: boolean;
  usedInReport: boolean;
}

export interface SourceDetailRecord {
  caseId: string;
  sourceId: string;
  title: string;
  description: string;
  status: SourceStatus;
  sourceType: "PDF" | "URL" | "NOTE";
  fileSize: string;
  chunksCount: number;
  indexedAt: string;
  modelUsed: string;
  tokenCount: string;
  summary: string;
  entities: string[];
  chunks: SourceChunk[];
  errors?: { title: string; detail: string; fix: string }[];
}

export const caseRecords: CaseRecord[] = [
  {
    id: "c_001",
    deskId: "deep-analysis",
    title: "Offshore Flow Analysis",
    project: "Project Alpha Horizon",
    status: "active",
    lastRunStatus: "running",
    owner: "Local Analyst",
    updatedAt: "2 hours ago",
    note: "Updated by AI Engine",
  },
  {
    id: "c_002",
    deskId: "deep-analysis",
    title: "Crypto Liquidity Audit",
    project: "Project Digital Assets",
    status: "processing",
    lastRunStatus: "queued",
    owner: "Local Analyst",
    updatedAt: "14 mins ago",
    note: "Parsing 1.2M transactions",
  },
  {
    id: "c_003",
    deskId: "deep-analysis",
    title: "Sanctions Screening V4",
    project: "Project Global Compliance",
    status: "urgent",
    lastRunStatus: "needs_review",
    owner: "Local Analyst",
    updatedAt: "Yesterday",
    note: "Action required: 3 flags",
  },
  {
    id: "c_004",
    deskId: "deep-analysis",
    title: "Legacy Bond Mapping",
    project: "Project Heritage Fund",
    status: "paused",
    lastRunStatus: "complete",
    owner: "Local Analyst",
    updatedAt: "3 days ago",
    note: "Waiting for data feed",
  },
  {
    id: "c_005",
    deskId: "macro-lens",
    title: "Commodity Stress Tracker",
    project: "Project Global Inputs",
    status: "active",
    lastRunStatus: "running",
    owner: "Local Analyst",
    updatedAt: "1 hour ago",
    note: "Model confidence refreshed",
  },
  {
    id: "c_006",
    deskId: "macro-lens",
    title: "Rates Shock Scenario",
    project: "Project Yield Curve",
    status: "processing",
    lastRunStatus: "needs_review",
    owner: "Local Analyst",
    updatedAt: "29 mins ago",
    note: "Building scenario matrix",
  },
];

export const caseDetailRecords: CaseDetailRecord[] = [
  {
    id: "c_001",
    title: "2024 Market Entry Strategy",
    status: "ANALYZING",
    prompt: "Should we expand our fintech offering to the UK market?",
    summary:
      "Analysis explores feasibility of entering the UK fintech ecosystem with emphasis on regulatory pathways, cost-to-launch profile, and competitive differentiation in digital banking.",
    createdAt: "Mar 12, 2026",
    tags: ["fintech", "uk-market", "regulation"],
    stats: { sources: 12, runs: 3, citations: 45, lastPublished: "2h ago" },
    goals: [
      "Evaluate FCA licensing requirements for e-money services",
      "Map top competitors in UK digital banking",
      "Analyze consumer adoption for contactless and crypto-backed payments",
      "Estimate initial infrastructure and compliance operating costs",
    ],
    sources: [
      {
        id: "s_1",
        sourceId: "q3-financial-projections",
        name: "FCA_Guidelines_v4.pdf",
        type: "PDF",
        status: "indexed",
        processedAt: "10 mins ago",
      },
      {
        id: "s_2",
        sourceId: "uk-open-banking-policy",
        name: "uk-open-banking-policy.gov",
        type: "URL",
        status: "ingesting",
        processedAt: "2 mins ago",
      },
      {
        id: "s_3",
        sourceId: "legacy-ops-note",
        name: "competitor-notes.md",
        type: "NOTE",
        status: "failed",
        processedAt: "Yesterday",
      },
    ],
    runs: [
      {
        id: "rr-9942-x",
        label: "Run 03 · Opportunity Scoring",
        status: "running",
        startedAt: "8 mins ago",
        duration: "00:08:21",
        stepsCompleted: 72,
      },
      {
        id: "rr-8801-a",
        label: "Run 02 · Regulatory Mapping",
        status: "needs_review",
        startedAt: "Yesterday",
        duration: "00:16:13",
        stepsCompleted: 100,
      },
      {
        id: "rr-7200-k",
        label: "Run 01 · Baseline Discovery",
        status: "complete",
        startedAt: "2 days ago",
        duration: "00:11:05",
        stepsCompleted: 100,
      },
    ],
    activity: [
      { id: "a1", text: "Analysis run initiated", at: "2m ago" },
      { id: "a2", text: "Source FCA_Guidelines_v4.pdf indexed", at: "10m ago" },
      { id: "a3", text: "Case goals updated", at: "Yesterday" },
    ],
  },
];

export const sourceDetailRecords: SourceDetailRecord[] = [
  {
    caseId: "c_001",
    sourceId: "q3-financial-projections",
    title: "Q3_Financial_Projections_v4.pdf",
    description:
      "Deep inspection of internal financial reporting for Q3 2024. This source provides foundational data for the current fiscal analysis desk.",
    status: "indexed",
    sourceType: "PDF",
    fileSize: "12.4 MB",
    chunksCount: 142,
    indexedAt: "Oct 12, 2024",
    modelUsed: "text-emb-3",
    tokenCount: "42.8k",
    summary:
      "The source highlights a strategic pivot toward AI-integrated financial workflows, noting significant revenue growth in institutional sectors while maintaining strict operational expense controls.",
    entities: ["Growth Patterns", "Risk Mitigation", "Q3 2024", "LLM"],
    chunks: [
      {
        id: "chunk-001",
        title: "Executive Summary",
        excerpt:
          "The primary drivers for third quarter growth are attributed to decentralized asset management tools and institutional API access acceleration.",
        pageRange: "Page 1 · Para 1-4",
        vectorized: true,
        usedInReport: true,
      },
      {
        id: "chunk-002",
        title: "Financial Metrics",
        excerpt:
          "Operating expenses remained stable at $4.2M, reflecting a disciplined approach to overhead while platform migration continued.",
        pageRange: "Page 2 · Para 5-8",
        vectorized: true,
        usedInReport: true,
      },
      {
        id: "chunk-003",
        title: "Risk Vectors",
        excerpt:
          "Key risks include compliance volatility in Asia markets and potential compute cost spikes during peak inference cycles.",
        pageRange: "Page 3 · Para 1-3",
        vectorized: true,
        usedInReport: false,
      },
    ],
  },
  {
    caseId: "c_001",
    sourceId: "legacy-ops-note",
    title: "legacy_ops_note.md",
    description:
      "Operational note imported from an archived research folder and awaiting normalization.",
    status: "failed",
    sourceType: "NOTE",
    fileSize: "34 KB",
    chunksCount: 0,
    indexedAt: "N/A",
    modelUsed: "N/A",
    tokenCount: "N/A",
    summary:
      "No summary available because extraction failed during content sanitation.",
    entities: [],
    chunks: [],
    errors: [
      {
        title: "Unsupported markdown table structure",
        detail:
          "Parser detected malformed nested table syntax during extract stage.",
        fix: "Clean source formatting and retry extraction.",
      },
    ],
  },
  {
    caseId: "c_001",
    sourceId: "uk-open-banking-policy",
    title: "uk-open-banking-policy.gov",
    description:
      "Government policy page used for current open-banking and compliance context checks.",
    status: "ingesting",
    sourceType: "URL",
    fileSize: "N/A",
    chunksCount: 28,
    indexedAt: "Processing",
    modelUsed: "text-emb-3",
    tokenCount: "6.1k",
    summary:
      "Ingestion is underway and early extraction indicates relevant updates on safeguarding and onboarding pathways.",
    entities: ["FCA", "Open Banking", "Onboarding"],
    chunks: [],
  },
];

export function normalizeDeskLabel(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCasesForDesk(id: string) {
  const deskCases = caseRecords.filter((item) => item.deskId === id);
  return deskCases.length > 0 ? deskCases : caseRecords;
}

export function getCaseById(id: string) {
  return caseRecords.find((item) => item.id === id) ?? caseRecords[0];
}

export function getCaseDetailById(id: string) {
  return caseDetailRecords.find((item) => item.id === id) ?? caseDetailRecords[0];
}

export function getSourceById(caseId: string, sourceId: string) {
  const exact = sourceDetailRecords.find(
    (source) => source.caseId === caseId && source.sourceId === sourceId
  );
  if (exact) return exact;

  const sameCase = sourceDetailRecords.find((source) => source.caseId === caseId);
  if (sameCase) return sameCase;

  return sourceDetailRecords[0];
}

export function getSourcesForCase(caseId: string) {
  const byCase = sourceDetailRecords.filter((source) => source.caseId === caseId);
  return byCase.length > 0 ? byCase : sourceDetailRecords;
}

export function getRunById(runId: string) {
  for (const detail of caseDetailRecords) {
    const run = detail.runs.find((item) => item.id === runId);
    if (run) return run;
  }

  return caseDetailRecords[0]?.runs[0];
}
