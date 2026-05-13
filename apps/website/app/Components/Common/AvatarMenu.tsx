"use client";

import { useEffect, useState } from "react";
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
import { appRoutes } from "@/lib/app-routes";

type MeSummary = {
  displayName: string;
  email: string | null;
  initials: string;
};

export default function AvatarMenu() {
  const router = useRouter();
  const [me, setMe] = useState<MeSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    void fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: MeSummary | null) => {
        if (mounted && payload) {
          setMe(payload);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback>{me?.initials ?? "AN"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              {me?.displayName ?? "Analyst"}
            </p>
            <p className="text-xs text-slate-500">
              {me?.email ?? "Authenticated session"}
            </p>
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
        <DropdownMenuItem asChild>
          <form action="/auth/signout" method="post" className="w-full">
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
