"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ApproveRunButton({ runId }: { runId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove() {
    setSubmitting(true);
    const response = await fetch(`/api/runs/${runId}/approve`, {
      method: "POST",
    });
    setSubmitting(false);
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <Button
      onClick={handleApprove}
      disabled={submitting}
      className="h-10 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
    >
      {submitting ? "Resuming..." : "Approve & Continue"}
    </Button>
  );
}
