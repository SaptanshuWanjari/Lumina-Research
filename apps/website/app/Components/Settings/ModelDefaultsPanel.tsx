"use client";

import { useState } from "react";

import StatusChip from "@/app/Components/Common/StatusChip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ModelDefaultsPanel() {
  const [depth, setDepth] = useState<"QUICK" | "STANDARD" | "DEEP">("STANDARD");
  const [strictness, setStrictness] = useState<"LENIENT" | "STRICT">("STRICT");
  const [reviewGate, setReviewGate] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Models</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tune analysis depth, citation strictness, and review behavior.
        </p>
      </div>

      {saved ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertTitle>Defaults saved</AlertTitle>
          <AlertDescription>Local model defaults were updated for future runs.</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-semibold text-slate-800">Default Run Depth</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["QUICK", "STANDARD", "DEEP"] as const).map((value) => (
              <Button
                key={value}
                variant={depth === value ? "default" : "outline"}
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => {
                  setSaved(false);
                  setDepth(value);
                }}
              >
                {value}
              </Button>
            ))}
          </div>
          <StatusChip tone="info" className="mt-3">
            {depth}
          </StatusChip>
        </article>

        <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-semibold text-slate-800">Citation Strictness</p>
          <div className="mt-3 flex gap-2">
            {(["LENIENT", "STRICT"] as const).map((value) => (
              <Button
                key={value}
                variant={strictness === value ? "default" : "outline"}
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => {
                  setSaved(false);
                  setStrictness(value);
                }}
              >
                {value}
              </Button>
            ))}
          </div>
          <StatusChip tone="success" className="mt-3">
            {strictness}
          </StatusChip>
        </article>

        <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-semibold text-slate-800">Human Review Gate</p>
          <p className="mt-1 text-sm text-slate-500">
            Require manual review before publish.
          </p>
          <Button
            variant={reviewGate ? "default" : "outline"}
            className="mt-3 h-8 rounded-full px-3 text-xs"
            onClick={() => {
              setSaved(false);
              setReviewGate((prev) => !prev);
            }}
          >
            {reviewGate ? "ENABLED" : "DISABLED"}
          </Button>
          <StatusChip tone={reviewGate ? "warn" : "neutral"} className="mt-3">
            {reviewGate ? "ENABLED" : "DISABLED"}
          </StatusChip>
        </article>
      </div>

      <Button
        className="h-10 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
        onClick={() => setSaved(true)}
      >
        Save Local Defaults
      </Button>
    </div>
  );
}
