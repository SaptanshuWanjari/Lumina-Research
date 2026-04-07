"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NotificationsButtonProps {
  href: string;
  count?: number;
}

export default function NotificationsButton({
  href,
  count = 0,
}: NotificationsButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative touch-manipulation rounded-full"
      asChild
    >
      <Link href={href} aria-label={`Notifications${count > 0 ? ` (${count})` : ""}`}>
        <Bell size={18} aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
