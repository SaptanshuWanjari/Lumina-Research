"use client";

import { Button } from "@/components/ui/button";
import { Archive, Download, RefreshCw } from "lucide-react";

export function ReSyncButton() {
  const handleReSync = () => {
    console.log("Re-sync Source: Starting source re-index pipeline...");
    alert("Re-sync Source: Starting source re-index pipeline...");
  };

  return (
    <Button 
      onClick={handleReSync}
      className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
    >

      <RefreshCw className="size-4" />
      Re-sync Source
    </Button>
  );
}

export function LaunchExplorerButton() {
  const handleLaunch = () => {
    console.log("Launch Explorer: Opening latent space visualization...");
    alert("Launch Explorer: Opening latent space visualization...");
  };

  return (
    <Button
      onClick={handleLaunch}
      variant="outline"
      className="mt-3 h-8 w-full rounded-full text-xs"
    >
      Launch Explorer
    </Button>
  );
}

export function SourceActionMenu() {
  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={() => {
          console.log("Download PDF: Starting download...");
          alert("Download PDF: Starting download...");
        }}
        type="button"
        className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
      >
        Download PDF <Download className="size-4" />
      </button>
      <button
        onClick={() => {
          console.log("Purge Index: Removing from index...");
          alert("Purge Index: Removing from index...");
        }}
        type="button"
        className="flex w-full items-center justify-between rounded-xl bg-rose-50 px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-100"
      >
        Purge Index <Archive className="size-4" />
      </button>
    </div>
  );
}
