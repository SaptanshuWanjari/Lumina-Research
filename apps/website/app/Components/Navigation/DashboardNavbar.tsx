"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppSearchInput from "../Common/AppSearchInput";
import AvatarMenu from "../Common/AvatarMenu";
import NotificationsButton from "../Common/NotificationsButton";
import { appRoutes, isActivePath, topNavItems } from "@/lib/app-routes";
// import { LogoIcon } from './LogoIcon';

const DashboardNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-2 lg:h-16 lg:flex-nowrap lg:px-6">
      <div className="flex w-full items-center gap-3 lg:w-auto lg:min-w-0 lg:flex-1">
        <SidebarTrigger
          aria-label="Toggle mobile sidebar"
          className="touch-manipulation md:hidden"
        />
        <SidebarTrigger
          aria-label="Toggle sidebar"
          className="hidden touch-manipulation md:inline-flex"
        />

        <Link href={appRoutes.dashboard} className="flex min-w-0 items-center gap-3">
          {/* <LogoIcon className="w-6 h-6 text-black shrink-0" /> */}
          <span className="truncate text-xl font-semibold text-slate-900">Lumina Research</span>
        </Link>

        {/* <nav className="ml-4 hidden items-center gap-2 lg:flex"> */}
        {/*   {topNavItems.map((item) => ( */}
        {/*     <Link */}
        {/*       key={item.label} */}
        {/*       href={item.href} */}
        {/*       className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${ */}
        {/*         isActivePath(pathname, item) */}
        {/*           ? "bg-slate-900 text-white" */}
        {/*           : "text-slate-600 hover:bg-slate-100 hover:text-slate-900" */}
        {/*       }`} */}
        {/*     > */}
        {/*       {item.label} */}
        {/*     </Link> */}
        {/*   ))} */}
        {/* </nav> */}

        <div className="ml-auto flex items-center gap-2">
          <AppSearchInput />
          <NotificationsButton href={appRoutes.dashboard} count={0} />
          <Button
            variant="ghost"
            size="icon"
            className="touch-manipulation rounded-full"
            asChild
          >
            <Link href={appRoutes.settings}>
              <Settings size={20} aria-hidden="true" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <AvatarMenu />
        </div>
      </div>

      <nav className="-mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
        {topNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
              isActivePath(pathname, item)
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DashboardNavbar;
