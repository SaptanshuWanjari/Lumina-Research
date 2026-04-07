"use client";

import { Button } from "@/components/ui/button";

export function RetryButton() {
  return (
    <Button
      onClick={() => {
        console.log("Retry Triggered: Retrying from last checkpoint...");
        alert("Retry Triggered: Retrying from last checkpoint...");
      }}
      variant="outline"
      className="mt-2 h-8 rounded-full border-rose-300 text-xs text-rose-700"
    >
      Retry from Checkpoint
    </Button>
  );
}
