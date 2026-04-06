"use client"

import Link from "next/link";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BiCompass } from "react-icons/bi";
import { Archive, TrendingUp, ChevronDown } from "lucide-react";
import { LiaThinkPeaks } from "react-icons/lia";

const SideBar = () => {
  const buttons = [
    {
      name: "Exploration",
      icon: <BiCompass size={20} />,
      link: "/exploration",
    },
    {
      name: "Trend Analysis",
      icon: <TrendingUp size={20} />,
      link: "/trend-analysis",
    },
    {
      name: "Sentiment",
      icon: <LiaThinkPeaks size={20} />,
      link: "/sentiment",
    },
    {
      name: "Archived",
      icon: <Archive size={20} />,
      link: "/archived",
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <span className="font-semibold">Project Name</span>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent align="start" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span className="text-xs text-muted-foreground">Your AI Research Companion</span>
                </DropdownMenuItem>
              </DropdownMenuContent> */}
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buttons.map((button) => (
                <SidebarMenuItem key={button.name}>
                  <SidebarMenuButton asChild tooltip={button.name}>
                    <Link href={button.link}>
                      {button.icon}
                      <span>{button.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className="w-full" size="sm">
              + New Search
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
};

export default SideBar;
