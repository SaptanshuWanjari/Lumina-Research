"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RunConfigDialogProps {
  caseId: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function RunConfigDialog({
  caseId,
  triggerLabel = "Run Analysis",
  triggerClassName,
}: RunConfigDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [depth, setDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [citationStrictness, setCitationStrictness] = useState<
    "lenient" | "strict"
  >("strict");
  const [humanReviewEnabled, setHumanReviewEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleStart() {
    setSubmitting(true);
    const response = await fetch(`/api/cases/${caseId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        depth,
        citation_strictness: citationStrictness,
        human_review_enabled: humanReviewEnabled,
      }),
    });
    setSubmitting(false);
    if (!response.ok) return;

    const run = (await response.json()) as { id: string };
    setOpen(false);
    router.push(`/runs/${run.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={
            triggerClassName ??
            "h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          }
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run Analysis</DialogTitle>
          <DialogDescription>
            Configure depth, citation strictness, and review controls.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="run-name">Run name</Label>
            <Input id="run-name" placeholder="Optional run label" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Depth</Label>
              <Select
                value={depth}
                onValueChange={(value) =>
                  setDepth(value as "quick" | "standard" | "deep")
                }
              >
                <SelectTrigger className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Citation strictness</Label>
              <Select
                value={citationStrictness}
                onValueChange={(value) =>
                  setCitationStrictness(value as "lenient" | "strict")
                }
              >
                <SelectTrigger className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lenient">Lenient</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <Checkbox
              checked={humanReviewEnabled}
              onCheckedChange={(checked) =>
                setHumanReviewEnabled(checked === true)
              }
            />
            <span>Enable human review gate before publish</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={submitting}>
            {submitting ? "Queueing..." : "Start Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
