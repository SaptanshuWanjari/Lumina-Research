"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SectionTabItem = {
  label: string;
  value: string;
};

interface SectionTabsProps {
  items: SectionTabItem[];
  value: string;
  queryKey?: string;
  basePath?: string;
}

export default function SectionTabs({
  items,
  value,
  queryKey = "tab",
  basePath,
}: SectionTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(queryKey, nextValue);
        router.push(`${basePath ?? pathname}?${params.toString()}`);
      }}
      className="w-full"
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5 md:grid-cols-5">
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="h-9 rounded-full text-xs font-semibold tracking-wide data-active:bg-slate-900 data-active:text-white"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
