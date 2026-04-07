"use client";

import { Button } from "@/components/ui/button";

export function RunReviewButtons() {
  const handleAction = (actionName: string) => {
    console.log(`Review Action: Successfully submitted ${actionName}`);
    alert(`Review Action: Successfully submitted ${actionName}`);
  };

  return (
    <div className="mt-3 space-y-2">
      <Button 
        onClick={() => handleAction("Approve & Continue")}
        className="h-9 w-full rounded-full bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800"
      >
        Approve & Continue
      </Button>
      <Button
        onClick={() => handleAction("Request Revision")}
        variant="outline"
        className="h-9 w-full rounded-full text-xs font-semibold"
      >
        Request Revision
      </Button>
      <Button
        onClick={() => handleAction("Reject Run")}
        variant="outline"
        className="h-9 w-full rounded-full border-rose-300 text-xs font-semibold text-rose-700"
      >
        Reject Run
      </Button>
    </div>
  );
}
