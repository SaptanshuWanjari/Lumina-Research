"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Search } from "lucide-react";

const Searchbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsString = params.toString();
  const [query, setQuery] = useState(params.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(paramsString);
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      next.delete("result");

      const nextString = next.toString();
      if (nextString === paramsString) return;

      const target = nextString ? `${pathname}?${nextString}` : pathname;
      router.replace(target, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, router, pathname, paramsString]);

  return (
    <div className="w-full ">
      <div className="relative flex items-center w-full">
        <Search
          size={22}
          className="absolute left-4 text-gray-400"
        />

        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search research…"
          className="pl-10 pr-28 py-6 rounded-full bg-white border-none focus-visible:ring-0"
        />

        <Button type="button" className="absolute right-2 rounded-full px-4 py-2 bg-black text-white hover:bg-black/90">
          Analyze
        </Button>
      </div>
    </div>
  );
};

export default Searchbar;
