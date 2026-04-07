"use client";

import { Button } from "@/components/ui/button";
import { Download, Square } from "lucide-react";

interface RunActionButtonsProps {
  status: "running" | "needs_review" | "complete";
}

export function RunActionButtons({ status }: RunActionButtonsProps) {
  const handleAction = (actionName: string) => {
    console.log(`Action Triggered: ${actionName}`);
    alert(`Action Triggered: ${actionName}`);
  };

  return (
    <>
      {status === "running" && (
        <Button 
          onClick={() => handleAction("Stop Run")}
          className="h-10 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          <Square className="size-4" />
          Stop Run
        </Button>
      )}
      {status === "needs_review" && (
        <>
          <Button 
            onClick={() => handleAction("Open Review")}
            className="h-10 rounded-full bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-900 cursor-pointer"
          >
            Open Review
          </Button>
          <Button
            onClick={() => handleAction("Resume Run")}
            variant="outline"
            className="h-10 rounded-full px-4 text-sm cursor-pointer"
          >
            Resume
          </Button>
        </>
      )}
      {status === "complete" && (
        <Button 
          onClick={() => handleAction("Open Report")}
          className="h-10 rounded-full bg-green-800 px-5 text-sm font-semibold text-white hover:bg-green-900"
        >
          Open Report
        </Button>
      )}
      <Button 
        onClick={() => handleAction("Download Trace")}
        variant="outline" 
        className="h-10 rounded-full px-4 text-sm cursor-pointer"
      >
        <Download className="size-4" />
        Download Trace
      </Button>
    </>
  );
}
