"use client";

import { useMemo, useState } from "react";
import { Check, FolderKanban, Plus } from "lucide-react";

import { caseRecords } from "@/lib/data/mock-cases";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AddToCaseDialogProps {
  sourceTitle: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

export default function AddToCaseDialog({
  sourceTitle,
  triggerClassName,
  triggerLabel = "Add to Case",
}: AddToCaseDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(caseRecords[0]?.id ?? null);

  const caseOptions = useMemo(
    () =>
      caseRecords.map((caseItem) => ({
        id: caseItem.id,
        title: caseItem.title,
        project: caseItem.project,
      })),
    []
  );
  const filteredCases = caseOptions.filter((caseItem) =>
    `${caseItem.title} ${caseItem.project}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={
            triggerClassName ??
            "h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          }
        >
          <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-white text-slate-900">
            <Plus className="size-3.5" />
          </span>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Result to Case</DialogTitle>
          <DialogDescription>
            Attach <span className="font-medium text-slate-700">{sourceTitle}</span> to an
            existing case for follow-up analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter cases..."
            className="rounded-full border-slate-200 bg-slate-50"
          />

          <div className="grid gap-3">
            {filteredCases.map((caseItem) => {
              const selected = selectedCaseId === caseItem.id;
              return (
                <button
                  key={caseItem.id}
                  type="button"
                  onClick={() => setSelectedCaseId(caseItem.id)}
                  className={`flex items-center justify-between rounded-[20px] border px-4 py-4 text-left transition-colors ${selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex size-9 items-center justify-center rounded-full ${selected ? "bg-white/15 text-white" : "bg-white text-slate-700"
                        }`}
                    >
                      <FolderKanban className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{caseItem.title}</p>
                      <p className={`mt-1 text-xs ${selected ? "text-slate-200" : "text-slate-500"}`}>
                        {caseItem.project}
                      </p>
                    </div>
                  </div>

                  {selected ? <Check className="size-4" /> : null}
                </button>
              );
            })}
            {filteredCases.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No matching cases found for this filter.
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            disabled={!selectedCaseId}
            onClick={() => {
              console.log(`Attach to Case: case ID ${selectedCaseId}`);
              alert(`Attach to Case: case ID ${selectedCaseId}`);
            }}
          >
            Attach to Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
