"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusChipTone = "info" | "success" | "warn" | "danger" | "neutral";

interface StatusChipProps {
  children: React.ReactNode;
  tone?: StatusChipTone;
  className?: string;
}

const toneClasses: Record<StatusChipTone, string> = {
  info: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  neutral: "bg-slate-200 text-slate-700",
};

export default function StatusChip({
  children,
  tone = "neutral",
  className,
}: StatusChipProps) {
  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-2 text-[14px] font-semibold tracking-[0.14em]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </Badge>
  );
}
