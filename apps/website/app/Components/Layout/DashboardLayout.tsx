"use client"

import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
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
        <div className="flex min-h-screen w-full bg-background">
          {/* Sidebar */}
          <SideBar />
          
          {/* Main content area */}
          <div className="flex flex-1 flex-col">
            {/* Navbar - sticky at top */}
            <header className="sticky top-0 z-40 w-full border-b bg-background">
              <DashboardNavbar />
            </header>
            
            {/* Page content */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
