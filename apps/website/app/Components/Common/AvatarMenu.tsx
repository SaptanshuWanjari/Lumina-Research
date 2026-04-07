"use client";

import { useRouter } from "next/navigation";
import { Settings, UserCircle2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appRoutes, localProfile } from "@/lib/mock-app";

export default function AvatarMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback>{localProfile.initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">{localProfile.name}</p>
            <p className="text-xs text-slate-500">{localProfile.focus}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(appRoutes.settings)}>
          <UserCircle2 className="size-4" />
          Local Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`${appRoutes.settings}?section=security`)}>
          <Settings className="size-4" />
          Preferences
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
