import type { LucideIcon } from "lucide-react";
import {
  FileSearch,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Workflow,
} from "lucide-react";

export type AppNavItem = {
  label: string;
  href: string;
  matchPrefix: string;
  icon: LucideIcon;
};

export const appRoutes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  cases: "/cases",
  search: "/search",
  reports: "/reports",
  settings: "/settings",
} as const;

export const topNavItems: AppNavItem[] = [
  {
    label: "Dashboard",
    href: appRoutes.dashboard,
    matchPrefix: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Cases",
    href: appRoutes.cases,
    matchPrefix: "/cases",
    icon: FolderKanban,
  },
  {
    label: "Search",
    href: appRoutes.search,
    matchPrefix: "/search",
    icon: Search,
  },
  {
    label: "Reports",
    href: appRoutes.reports,
    matchPrefix: "/report",
    icon: FileSearch,
  },
];

export const sidebarNavItems: AppNavItem[] = [
  ...topNavItems,
  {
    label: "Runs",
    href: appRoutes.dashboard,
    matchPrefix: "/runs",
    icon: Workflow,
  },
  {
    label: "Preferences",
    href: appRoutes.settings,
    matchPrefix: "/settings",
    icon: Settings,
  },
];

export const quickActions = [
  { label: "New Analysis", href: appRoutes.cases },
];

export function isActivePath(pathname: string, item: AppNavItem) {
  return (
    pathname === item.href ||
    pathname === item.matchPrefix ||
    pathname.startsWith(`${item.matchPrefix}/`)
  );
}
