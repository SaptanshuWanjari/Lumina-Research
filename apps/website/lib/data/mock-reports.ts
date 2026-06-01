export interface CitationItem {
  id: string;
  title: string;
  excerpt: string;
  source: string;
}

export interface ReportOverview {
  id: string;
  title: string;
  date: string;
  readTime: string;
  version: string;
  status: "REPORT DRAFT" | "PUBLISHED";
  executiveSummary: string;
  resilienceSection: string;
  citations: CitationItem[];
  verificationAccuracy: number;
  contextDatasets: number;
}

export const reports: ReportOverview[] = [
  {
    id: "semiconductor-q3",
    title: "Q3 Semiconductor Market Analysis & Predictive Outlook",
    date: "Oct 24, 2023",
    readTime: "12 min read",
    version: "v2.4",
    status: "REPORT DRAFT",
    executiveSummary:
      "The semiconductor industry has observed a significant shift in capital expenditure toward AI-specific silicon. While consumer electronics segments remained soft, enterprise demand accelerated through hyperscale providers expanding inference infrastructure. Current growth models project a 24% CAGR over the next five years, led by data-center acceleration stacks.",
    resilienceSection:
      "Geopolitical pressure continues to reshape sourcing strategies. Tier-1 manufacturers are adopting multi-region redundancy while inventory for legacy nodes remains elevated. This dynamic is preserving short-term pricing pressure, particularly for automotive-grade 28nm-65nm bands.",
    citations: [
      {
        id: "01",
        title: "Global Hyperscale Infrastructure Report 2023",
        excerpt:
          "Spending for AI inference expected to grow by 24% CAGR through 2028.",
        source: "Gartner Research",
      },
      {
        id: "02",
        title: "Quarterly Earnings Call: TSMC Q2",
        excerpt:
          "Demand for 3nm remains strong while legacy node build-up persists.",
        source: "Earnings Transcript",
      },
      {
        id: "03",
        title: "ASML Annual Lithography Outlook",
        excerpt:
          "Lead times for EUV systems extended to 18-24 months in key regions.",
        source: "ASML Investor Report",
      },
    ],
    verificationAccuracy: 98,
    contextDatasets: 14,
  },
  {
    id: "fintech-uk-entry",
    title: "UK Fintech Expansion Readiness Review",
    date: "Mar 12, 2026",
    readTime: "9 min read",
    version: "v1.3",
    status: "REPORT DRAFT",
    executiveSummary:
      "UK market entry feasibility remains favorable across licensing, infrastructure, and demand vectors, though first-year compliance overhead is expected to be above baseline due to reporting and operational governance requirements.",
    resilienceSection:
      "Risk posture improves when onboarding includes staged launch windows, regional data-residency checks, and pre-approved fallback partners for payments and KYC verification.",
    citations: [
      {
        id: "01",
        title: "FCA Consultation Paper CP23/24",
        excerpt: "New e-money guidance clarifies onboarding and safeguarding.",
        source: "FCA",
      },
      {
        id: "02",
        title: "UK Open Banking Adoption Benchmarks",
        excerpt: "Consumer active adoption increased year-over-year.",
        source: "OBIE",
      },
      {
        id: "03",
        title: "Internal Market Validation Dataset",
        excerpt: "Projected break-even achievable within 18-24 months.",
        source: "Lumina Internal",
      },
    ],
    verificationAccuracy: 95,
    contextDatasets: 9,
  },
];

export function findReport(id: string) {
  return reports.find((item) => item.id === id) ?? reports[0];
}
