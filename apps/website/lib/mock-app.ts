import type { LucideIcon } from "lucide-react";
import {
  FileSearch,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import { caseDetailRecords } from "@/lib/mock-cases";
import { reports } from "@/lib/mock-reports";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix: string;
};

export type LocalProfile = {
  name: string;
  initials: string;
  focus: string;
};

export const localProfile: LocalProfile = {
  name: "Local Analyst",
  initials: "LA",
  focus: "Private research mode",
};

export const notificationCount = 3;

const defaultCaseId = caseDetailRecords[0]?.id ?? "c_001";
const defaultRunId = caseDetailRecords[0]?.runs[0]?.id ?? "rr-9942-x";
const defaultReportId = reports[0]?.id ?? "fintech-uk-entry";

export const appRoutes = {
  dashboard: "/dashboard",
  search: "/search",
  settings: "/settings",
  reports: "/reports",
  caseDesk: `/cases/deep-analysis`,
  caseDetail: `/cases/${defaultCaseId}/details`,
  runDetail: `/runs/${defaultRunId}`,
  reportOverview: `/report/${defaultReportId}/overview`,
} as const;

export const topNavItems: AppNavItem[] = [
  {
    label: "Dashboard",
    href: appRoutes.dashboard,
    icon: LayoutDashboard,
    matchPrefix: "/dashboard",
  },
  {
    label: "Cases",
    href: appRoutes.caseDesk,
    icon: FolderKanban,
    matchPrefix: "/cases",
  },
  {
    label: "Search",
    href: appRoutes.search,
    icon: Search,
    matchPrefix: "/search",
  },
  {
    label: "Reports",
    href: appRoutes.reports,
    icon: FileSearch,
    matchPrefix: "/report",
  },
];

export const sidebarNavItems: AppNavItem[] = [
  {
    label: "Dashboard",
    href: appRoutes.dashboard,
    icon: LayoutDashboard,
    matchPrefix: "/dashboard",
  },
  {
    label: "Cases",
    href: appRoutes.caseDesk,
    icon: FolderKanban,
    matchPrefix: "/cases",
  },
  {
    label: "Search",
    href: appRoutes.search,
    icon: Search,
    matchPrefix: "/search",
  },
  {
    label: "Runs",
    href: appRoutes.runDetail,
    icon: Workflow,
    matchPrefix: "/runs",
  },
  {
    label: "Reports",
    href: appRoutes.reports,
    icon: FileSearch,
    matchPrefix: "/report",
  },
  {
    label: "Preferences",
    href: appRoutes.settings,
    icon: Settings,
    matchPrefix: "/settings",
  },
];

export const quickActions = [
  {
    label: "New Analysis",
    href: appRoutes.caseDesk,
    icon: Sparkles,
  },
];

export function isActivePath(pathname: string, item: AppNavItem) {
  return (
    pathname === item.href ||
    pathname === item.matchPrefix ||
    pathname.startsWith(`${item.matchPrefix}/`)
  );
}
