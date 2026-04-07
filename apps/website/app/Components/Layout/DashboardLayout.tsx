"use client"

import { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import SideBar from "../Utility/SideBar";
import DashboardNavbar from "../Navigation/DashboardNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-slate-50">
          <SideBar />

          <SidebarInset className="min-h-screen">
            <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
              <DashboardNavbar />
            </header>

            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
