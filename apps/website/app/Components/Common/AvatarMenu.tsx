"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserCircle2 } from "lucide-react";

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

const dropdownButtons = [
  {
    label: "Local Profile",
    icon: UserCircle2,
    onClick: (router: ReturnType<typeof useRouter>) =>
      router.push(appRoutes.settings),
  },
];

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
          <Avatar className="h-9 w-9 ring-1 ring-slate-200">
            <AvatarImage src="" />
            <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
              {me?.initials ?? "AN"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="min-w-[260px] rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-0 before:hidden"
      >
        <DropdownMenuLabel className="px-3 py-3">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              {me?.displayName ?? "Analyst"}
            </p>

            <p className="text-xs text-slate-500">
              {me?.email ?? "Authenticated session"}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-2 my-1 bg-slate-200" />

        {dropdownButtons.map((button) => {
          const Icon = button.icon;

          return (
            <DropdownMenuItem
              key={button.label}
              onClick={() => button.onClick(router)}
              className="
                mx-1 rounded-2xl px-3 py-2.5
                text-sm font-medium
                transition-colors

                hover:bg-slate-100
                focus:bg-slate-100!
                data-highlighted:bg-slate-100!

                **:text-slate-700
                hover:**:text-slate-900!
                focus:**:text-slate-900!
                data-highlighted:**:text-slate-900!
              "
            >
              <Icon className="size-4" />
              <span>{button.label}</span>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="mx-2 my-1 bg-slate-200" />

        <DropdownMenuItem
          asChild
          className="
            mx-1 rounded-2xl px-0 py-0
            text-sm font-medium
            transition-colors

            hover:bg-slate-100
            focus:bg-slate-100!
            data-highlighted:bg-slate-100!

            **:text-slate-700
            hover:**:text-slate-900!
            focus:**:text-slate-900!
            data-highlighted:**:text-slate-900!
          "
        >
          <form action="/auth/signout" method="post" className="w-full">
            <button
              type="submit"
              className="
                flex w-full items-center gap-2.5
                rounded-2xl px-3 py-2.5 text-left
                transition-colors
              "
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
