"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function RetryButton({ runId }: { runId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleRetry() {
    setSubmitting(true);
    const response = await fetch(`/api/runs/${runId}/retry`, {
      method: "POST",
    });
    setSubmitting(false);
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <Button
      onClick={handleRetry}
      disabled={submitting}
      variant="outline"
      className="mt-2 h-8 rounded-full border-rose-300 text-xs text-rose-700"
    >
      {submitting ? "Queueing retry..." : "Retry from failed step"}
    </Button>
  );
}
