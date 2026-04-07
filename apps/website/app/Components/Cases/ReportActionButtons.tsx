"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ReportActionButtons({ caseId }: { caseId: string }) {
  const router = useRouter();

  const handleAction = (actionName: string) => {
    console.log(`Action Initiated: ${actionName} workflow has been started.`);
    alert(`Action Initiated: ${actionName} workflow has been started.`);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button 
        onClick={() => router.push(`/report/${caseId}/overview`)}
        className="h-9 rounded-full bg-slate-900 px-4 text-xs text-white hover:bg-slate-700"
      >
        Review &amp; Edit
      </Button>
      <Button 
        onClick={() => handleAction("Re-run")}
        variant="outline" 
        className="h-9 rounded-full px-4 text-xs"
      >
        Request Re-run
      </Button>
      <Button 
        onClick={() => handleAction("Publish")}
        variant="outline" 
        className="h-9 rounded-full px-4 text-xs"
      >
        Publish
      </Button>
    </div>
  );
}
