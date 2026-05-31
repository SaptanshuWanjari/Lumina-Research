"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

interface AppSearchInputProps {
  placeholder?: string;
}

export default function AppSearchInput({
  placeholder = "Search research...",
}: AppSearchInputProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return (
    <form
      action="/search"
      method="get"
      className="relative w-full max-w-none sm:max-w-[320px]"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className="h-10 rounded-full border-slate-200 bg-slate-100 pl-10 pr-4 text-sm focus-visible:ring-0"
      />
    </form>
  );
}
