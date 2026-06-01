import {
  Database,
  FileText,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { appRoutes } from "@/lib/data/mock-app";

export interface DashboardStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface DashboardRecentCase {
  id: string;
  title: string;
  subtitle: string;
  status: "RUNNING" | "INGESTING" | "READY";
  lastUpdated: string;
  href: string;
}

export interface DashboardReviewItem {
  id: string;
  type: "CONFLICT DETECTION" | "HUMAN REVIEW";
  title: string;
  description: string;
  severity?: "high" | "medium";
  href: string;
}

export const dashboardStats: DashboardStat[] = [
  { icon: Zap, value: "24", label: "Active Cases" },
  { icon: Database, value: "1.2k", label: "Sources Ingested" },
  { icon: FileText, value: "142", label: "Reports Published" },
  { icon: ShieldCheck, value: "94%", label: "Citation Cov." },
];

export const dashboardRecentCases: DashboardRecentCase[] = [
  {
    id: "c_001",
    title: "Global Supply Chain Fragility 2024",
    subtitle: "Economics / Logistics",
    status: "RUNNING",
    lastUpdated: "14 mins ago",
    href: "/cases/c_001/details",
  },
  {
    id: "c_002",
    title: "Semiconductor Lithography Trends",
    subtitle: "Technology / Geopolitics",
    status: "INGESTING",
    lastUpdated: "2 hours ago",
    href: "/cases/c_002/details",
  },
  {
    id: "c_003",
    title: "Digital Asset Regulatory Framework",
    subtitle: "Markets / Policy",
    status: "READY",
    lastUpdated: "Yesterday",
    href: "/cases/c_003/details",
  },
];

export const dashboardNeedsReview: DashboardReviewItem[] = [
  {
    id: "r_001",
    type: "CONFLICT DETECTION",
    title: "Q3 Revenue Discrepancy",
    description:
      "Three sources diverge on the court filing interpretation. Review the retrieval set before final synthesis continues.",
    severity: "high",
    href: appRoutes.runDetail,
  },
  {
    id: "r_002",
    type: "HUMAN REVIEW",
    title: "Citation Validation",
    description:
      "Confirm support strength for the latest claim cluster before the report draft is promoted.",
    severity: "medium",
    href: appRoutes.reportOverview,
  },
];
