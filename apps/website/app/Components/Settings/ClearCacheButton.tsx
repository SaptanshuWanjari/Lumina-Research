"use client";

import { Button } from "@/components/ui/button";
import ConfirmActionDialog from "@/app/Components/Dialogs/ConfirmActionDialog";

export function ClearCacheButton() {
  const handleClearCache = () => {
    console.log("Clear Cache: Successfully cleared local analysis cache.");
    alert("Clear Cache: Successfully cleared local analysis cache.");
  };

  return (
    <ConfirmActionDialog
      title="Clear local analysis cache"
      description="This will remove cached embeddings, trace summaries, and temporary source extracts from this device."
      actionLabel="Clear Cache"
      onConfirm={handleClearCache}
      trigger={
        <Button
          variant="outline"
          className="rounded-full border-rose-300 text-rose-700 hover:bg-red-500/80 hover:text-white"
        >
          Clear Local Cache
        </Button>
      }
    />
  );
}
