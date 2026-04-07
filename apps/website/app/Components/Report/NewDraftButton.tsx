"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function NewDraftButton() {
  const router = useRouter();

  const handleNewDraft = () => {
    console.log("New Draft: Navigating to draft creation...");
    alert("New Draft: Navigating to draft creation...");
  };

  return (
    <Button 
      onClick={handleNewDraft}
      className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
    >
      New Draft
    </Button>
  );
}
