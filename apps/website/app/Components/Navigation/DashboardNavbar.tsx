"use client"

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BsBell } from "react-icons/bs";
import { Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const DashboardNavbar = () => {
  return (
    <div className="flex h-16 items-center gap-4 px-4">
      {/* Sidebar trigger for mobile/collapsed state */}
      <SidebarTrigger />
      
      {/* Logo/Brand */}
      <div className="flex items-center">
        <h2 className="text-xl font-semibold">Lumina Research</h2>
      </div>
      
      {/* Navigation links */}
      <nav className="flex items-center gap-6 ml-8">
        <Link 
          href="/research" 
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Research
        </Link>
        <Link 
          href="/library" 
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Library
        </Link>
        <Link 
          href="/datasets" 
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Datasets
        </Link>
        <Link 
          href="/models" 
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Models
        </Link>
      </nav>
      
      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <BsBell size={20} />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings size={20} />
          <span className="sr-only">Settings</span>
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default DashboardNavbar;
