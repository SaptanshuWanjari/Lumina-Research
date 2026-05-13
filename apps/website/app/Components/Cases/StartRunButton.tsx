"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function StartRunButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleStart() {
    setSubmitting(true);
    const response = await fetch(`/api/cases/${caseId}/runs`, {
      method: "POST",
    });
    setSubmitting(false);
    if (!response.ok) return;

    const run = (await response.json()) as { id: string };
    router.push(`/runs/${run.id}`);
    router.refresh();
  }

  return (
    <Button
      onClick={handleStart}
      disabled={submitting}
      className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
    >
      {submitting ? "Queueing..." : "Start Run"}
    </Button>
  );
}
