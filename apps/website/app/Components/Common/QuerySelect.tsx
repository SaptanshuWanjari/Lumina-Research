"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuerySelectProps {
  queryKey: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  basePath?: string;
  triggerClassName?: string;
}

export default function QuerySelect({
  queryKey,
  value,
  options,
  basePath,
  triggerClassName,
}: QuerySelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(queryKey, nextValue);
        router.push(`${basePath ?? pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger
        className={
          triggerClassName ??
          "h-10 min-w-[180px] rounded-full border border-slate-200 bg-white px-4"
        }
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

