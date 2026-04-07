"use client";

import { Button } from "@/components/ui/button";
import ConfirmActionDialog from "@/app/Components/Dialogs/ConfirmActionDialog";

export function ReportActionButtons() {
  const handleSaveDraft = () => {
    console.log("Draft Saved: Report draft has been successfully saved to your local library.");
    alert("Draft Saved: Report draft has been successfully saved to your local library.");
  };

  const handlePublish = () => {
    console.log("Report Published: Your report has been successfully published.");
    alert("Report Published: Your report has been successfully published.");
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <Button
        onClick={handleSaveDraft}
        variant="ghost"
        className="h-10 rounded-full bg-slate-200 px-4 text-sm font-semibold text-slate-700"
      >
        Save Draft
      </Button>
      <ConfirmActionDialog
        title="Publish report"
        description="This will publish the current reviewed draft into the local report library."
        actionLabel="Publish"
        actionVariant="default"
        onConfirm={handlePublish}
        trigger={
          <Button className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white">
            Publish
          </Button>
        }
      />
    </div>
  );
}
