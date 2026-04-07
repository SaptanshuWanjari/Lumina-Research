"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface AppSearchInputProps {
  placeholder?: string;
}

export default function AppSearchInput({
  placeholder = "Search research...",
}: AppSearchInputProps) {
  return (
    <div className="relative hidden w-full max-w-[320px] lg:block">
      <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="h-10 rounded-full border-slate-200 bg-slate-100 pl-10 pr-4 text-sm focus-visible:ring-0"
      />
    </div>
  );
}
