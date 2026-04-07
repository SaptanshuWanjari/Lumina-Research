"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { isActivePath, quickActions, sidebarNavItems } from "@/lib/mock-app";
import { Sparkles } from "lucide-react";

const SideBar = () => {
  const pathname = usePathname();


  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/50">
          Research Desk
        </SidebarGroupLabel>
        <div className="rounded-2xl bg-slate-100 px-3 py-3">
          <p className="text-sm font-semibold text-slate-800">Local Analyst</p>
          <p className="text-xs text-slate-500">Private research mode</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/50">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActivePath(pathname, item)}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/50">
            Quick Action
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild tooltip={item.label} variant="outline">
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-2xl bg-slate-100 px-3 py-3 text-sm text-slate-600">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="size-4" />
            <span className="font-semibold">Local Notes</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Keep analysis context and quick reminders close to the shell.
          </p>
        </div>
        <Button variant="outline" className="rounded-full">
          Open Notes
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SideBar;
