"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSearchInput from "../Common/AppSearchInput";
import AvatarMenu from "../Common/AvatarMenu";
import { isActivePath, topNavItems } from "@/lib/mock-app";

const DashboardNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
      <SidebarTrigger className="md:hidden" />

      <Link href="/dashboard" className="flex items-center gap-3">
        <span className="text-xl font-semibold text-slate-900">Lumina Research</span>
      </Link>

      <nav className="ml-4 hidden items-center gap-2 lg:flex">
        {topNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActivePath(pathname, item)
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <AppSearchInput />
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/settings?section=general">
            <Settings size={20} />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
        <AvatarMenu />
      </div>
    </div>
  );
};

export default DashboardNavbar;
