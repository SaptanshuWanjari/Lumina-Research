import { appRoutes } from "@/lib/data/mock-app";

export type SearchScope = "sources" | "chunks" | "reports";

export type SearchSnippetPart = {
  text: string;
  highlight?: boolean;
};

export interface SearchResultItem {
  id: string;
  scope: SearchScope;
  title: string;
  publisher: string;
  type: string;
  date: string;
  confidence: number;
  relevance: "HIGH" | "MEDIUM" | "LOW";
  sourceKind: string;
  sourceHref: string;
  snippet: SearchSnippetPart[];
  keyEntities: string[];
  summary: string;
}

export const activeSearchTags = [
  "Financial Markets",
  "Cryptocurrency",
  "Stock Analysis",
];

export const searchScopeOptions: Array<{
  label: string;
  value: SearchScope;
}> = [
  { label: "Sources", value: "sources" },
  { label: "Chunks", value: "chunks" },
  { label: "Reports", value: "reports" },
];

export const searchTimeFilters = [
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
];

export const searchDataSources = ["Twitter", "Reddit", "News Articles"];

export const searchResults: SearchResultItem[] = [
  {
    id: "1",
    scope: "sources",
    title: "The Quantum Leap: Infrastructure Readiness for Global Banking",
    publisher: "Goldman Sachs",
    type: "Whitepaper",
    date: "Mar 12, 2024",
    confidence: 98,
    relevance: "HIGH",
    sourceKind: "PDF",
    sourceHref: "/cases/c_001/sources/q3-financial-projections",
    snippet: [
      { text: "…expected that " },
      { text: "quantum computing", highlight: true },
      { text: " will fundamentally disrupt RSA encryption by " },
      { text: "late 2024", highlight: true },
      { text: ", forcing global " },
      { text: "financial markets", highlight: true },
      {
        text: " to transition to post-quantum cryptography. Infrastructure readiness currently at 12% among Tier 1 banks…",
      },
    ],
    keyEntities: ["RSA", "Tier 1 Banks", "NIST Standards"],
    summary:
      "This source frames post-quantum readiness as an immediate banking infrastructure concern, with direct implications for cryptographic migration planning and policy alignment.",
  },
  {
    id: "2",
    scope: "chunks",
    title: "Post-Quantum Risk Signals Across Regional Payment Networks",
    publisher: "Bank of America",
    type: "Research Brief",
    date: "Feb 07, 2025",
    confidence: 94,
    relevance: "HIGH",
    sourceKind: "Extracted Chunk",
    sourceHref: "/cases/c_001/sources/legacy-ops-note",
    snippet: [
      { text: "…regional clearinghouses report " },
      { text: "legacy key exchange", highlight: true },
      { text: " dependencies across " },
      { text: "cross-border settlements", highlight: true },
      {
        text: ", with migration readiness concentrated in fewer than one-third of sampled institutions…",
      },
    ],
    keyEntities: ["SWIFT", "PQC Migration", "Payment Rails"],
    summary:
      "The extracted passage isolates an operational weakness in payment rails, linking cryptographic dependencies to regional settlement exposure and migration bottlenecks.",
  },
  {
    id: "3",
    scope: "reports",
    title: "Cryptographic Resilience in the Age of Quantum Threats",
    publisher: "JPMorgan Chase",
    type: "Technical Report",
    date: "Jan 15, 2025",
    confidence: 91,
    relevance: "MEDIUM",
    sourceKind: "Published Report",
    sourceHref: appRoutes.reportOverview,
    snippet: [
      { text: "…analysis of " },
      { text: "quantum-resistant algorithms", highlight: true },
      {
        text: " reveals significant performance trade-offs, with projected latency increases of up to 40% in high-frequency trading environments…",
      },
    ],
    keyEntities: [
      "Lattice-Based Cryptography",
      "HFT Latency",
      "Algorithmic Trading",
    ],
    summary:
      "This report is useful for balancing cryptographic resilience against market-structure performance costs, especially where low-latency execution systems are involved.",
  },
];

export function normalizeSearchScope(value?: string | string[]): SearchScope {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed === "sources" || parsed === "chunks" || parsed === "reports") {
    return parsed;
  }
  return "sources";
}

export function getSearchResultsForScope(scope: SearchScope) {
  const scoped = searchResults.filter((item) => item.scope === scope);
  return scoped.length > 0 ? scoped : searchResults;
}

export function getSearchResults(scope: SearchScope, query?: string) {
  const scoped = getSearchResultsForScope(scope);
  const normalized = query?.trim().toLowerCase() ?? "";
  if (!normalized) return scoped;

  const matched = scoped.filter((item) => {
    const haystack = [
      item.title,
      item.publisher,
      item.type,
      item.summary,
      item.keyEntities.join(" "),
      item.snippet.map((part) => part.text).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  return matched;
}
