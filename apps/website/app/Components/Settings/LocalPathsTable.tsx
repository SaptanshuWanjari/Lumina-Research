"use client";

import { useState } from "react";

import StatusChip from "@/app/Components/Common/StatusChip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocalPathItem {
  name: string;
  path: string;
  description: string;
  status: "ACTIVE" | "INDEXED";
}

interface LocalPathsTableProps {
  initialSources: LocalPathItem[];
}

export default function LocalPathsTable({ initialSources }: LocalPathsTableProps) {
  const [sources, setSources] = useState(initialSources);
  const [path, setPath] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const addPath = () => {
    const trimmed = path.trim();
    if (!trimmed) {
      setMessage("Enter a valid local path before adding.");
      return;
    }

    setSources((prev) => [
      {
        name: "Custom Source",
        path: trimmed,
        description: "User-added local directory",
        status: "ACTIVE",
      },
      ...prev,
    ]);
    setPath("");
    setMessage("Data path added. Source discovery will include this directory.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Data Sources</h2>
          <p className="mt-1 text-sm text-slate-500">
            Local directories and research feeds used during analysis.
          </p>
        </div>
      </div>

      {message ? (
        <Alert className="border-slate-200 bg-slate-50">
          <AlertTitle>Local data update</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="/analysis/local-store/new-dataset"
          className="h-10 rounded-full border-slate-200 bg-slate-50"
        />
        <Button
          className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={addPath}
        >
          Add Data Path
        </Button>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <article key={source.path} className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{source.path}</p>
                <p className="text-sm text-slate-500">{source.description}</p>
              </div>
              <StatusChip tone={source.status === "ACTIVE" ? "success" : "info"}>
                {source.status}
              </StatusChip>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
