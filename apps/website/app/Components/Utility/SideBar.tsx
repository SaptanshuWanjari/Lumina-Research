"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { isActivePath, quickActions, sidebarNavItems } from "@/lib/app-routes";

const SideBar = () => {
  const pathname = usePathname();


  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarGroupLabel className="px-3 text-[16px] uppercase tracking-[0.16em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          Research Desk
        </SidebarGroupLabel>
        <div className="rounded-[13px] bg-slate-100 px-3 py-3 group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold text-slate-800">Lumina Research</p>
          <p className="text-xs text-slate-500">Supabase cloud workspace</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[15px] uppercase tracking-[0.16em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
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
          <SidebarGroupLabel className="px-3 text-[15px] uppercase tracking-[0.16em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
            Quick Action
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => {
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild tooltip={item.label} variant="outline">
                      <Link href={item.href}>
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
    </Sidebar>
  );
};

export default SideBar;
