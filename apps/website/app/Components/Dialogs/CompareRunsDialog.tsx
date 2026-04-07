"use client";

import { useState } from "react";

import type { CaseRunSummary } from "@/lib/mock-cases";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CompareRunsDialogProps {
  runs: CaseRunSummary[];
}

export default function CompareRunsDialog({ runs }: CompareRunsDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(-2)
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 rounded-full text-xs">
          Compare Runs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Compare Runs</DialogTitle>
          <DialogDescription>
            Select up to 2 runs to compare status, duration, and output quality side by side.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {runs.map((run) => {
            const checked = selected.includes(run.id);
            return (
              <label
                key={run.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 ${
                  checked ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{run.label}</p>
                  <p className="text-xs text-slate-500">
                    {run.status.replace("_", " ")} · {run.duration}
                  </p>
                </div>
                <Checkbox checked={checked} onCheckedChange={() => toggle(run.id)} />
              </label>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button 
            disabled={selected.length < 2}
            onClick={() => {
              console.log(`Open Compare View: comparing ${selected.join(" and ")}`);
              alert(`Open Compare View: comparing ${selected.join(" and ")}`);
            }}
          >
            Open Compare View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
