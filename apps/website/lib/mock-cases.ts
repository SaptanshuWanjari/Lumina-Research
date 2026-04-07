export type CaseStatus = "active" | "processing" | "urgent" | "paused";

export interface CaseRecord {
  id: string;
  deskId: string;
  title: string;
  project: string;
  status: CaseStatus;
  updatedAt: string;
  note: string;
}

export const caseRecords: CaseRecord[] = [
  {
    id: "c_001",
    deskId: "deep-analysis",
    title: "Offshore Flow Analysis",
    project: "Project Alpha Horizon",
    status: "active",
    updatedAt: "2 hours ago",
    note: "Updated by AI Engine",
  },
  {
    id: "c_002",
    deskId: "deep-analysis",
    title: "Crypto Liquidity Audit",
    project: "Project Digital Assets",
    status: "processing",
    updatedAt: "14 mins ago",
    note: "Parsing 1.2M transactions",
  },
  {
    id: "c_003",
    deskId: "deep-analysis",
    title: "Sanctions Screening V4",
    project: "Project Global Compliance",
    status: "urgent",
    updatedAt: "Yesterday",
    note: "Action required: 3 flags",
  },
  {
    id: "c_004",
    deskId: "deep-analysis",
    title: "Legacy Bond Mapping",
    project: "Project Heritage Fund",
    status: "paused",
    updatedAt: "3 days ago",
    note: "Waiting for data feed",
  },
  {
    id: "c_005",
    deskId: "macro-lens",
    title: "Commodity Stress Tracker",
    project: "Project Global Inputs",
    status: "active",
    updatedAt: "1 hour ago",
    note: "Model confidence refreshed",
  },
  {
    id: "c_006",
    deskId: "macro-lens",
    title: "Rates Shock Scenario",
    project: "Project Yield Curve",
    status: "processing",
    updatedAt: "29 mins ago",
    note: "Building scenario matrix",
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

