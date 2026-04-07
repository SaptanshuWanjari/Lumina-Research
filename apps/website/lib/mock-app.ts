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

export const topNavItems: AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    matchPrefix: "/dashboard",
  },
  {
    label: "Cases",
    href: "/cases/research-desk",
    icon: FolderKanban,
    matchPrefix: "/cases",
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
    matchPrefix: "/search",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileSearch,
    matchPrefix: "/report",
  },
];

export const sidebarNavItems: AppNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    matchPrefix: "/dashboard",
  },
  {
    label: "Cases",
    href: "/cases/research-desk",
    icon: FolderKanban,
    matchPrefix: "/cases",
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
    matchPrefix: "/search",
  },
  {
    label: "Runs",
    href: "/runs/rr-9942-x",
    icon: Workflow,
    matchPrefix: "/runs",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileSearch,
    matchPrefix: "/report",
  },
  {
    label: "Preferences",
    href: "/settings?section=general",
    icon: Settings,
    matchPrefix: "/settings",
  },
];

export const quickActions = [
  {
    label: "New Analysis",
    href: "/cases/research-desk",
    icon: Sparkles,
  },
];

export function isActivePath(pathname: string, item: AppNavItem) {
  return pathname === item.href || pathname.startsWith(item.matchPrefix);
}
