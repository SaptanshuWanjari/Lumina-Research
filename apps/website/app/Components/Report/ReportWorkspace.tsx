"use client";

import { useMemo, useState } from "react";

import type { ReportOverview } from "@/lib/data/mock-reports";
import ReportEditorSurface from "@/app/Components/Report/ReportEditorSurface";
import CitationSidebar from "@/app/Components/Report/CitationSidebar";
import ClaimInspector from "@/app/Components/Report/ClaimInspector";

interface ReportWorkspaceProps {
  report: ReportOverview;
}

export default function ReportWorkspace({ report }: ReportWorkspaceProps) {
  const [selectedCitationId, setSelectedCitationId] = useState<string | undefined>(
    report.citations[0]?.id
  );
  const [selectedClaim, setSelectedClaim] = useState(report.executiveSummary);

  const selectedCitation = useMemo(
    () => report.citations.find((item) => item.id === selectedCitationId),
    [report.citations, selectedCitationId]
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2.1fr)_340px]">
      <div className="space-y-5">
        <ReportEditorSurface
          report={report}
          selectedCitationId={selectedCitationId}
          onSelectCitation={setSelectedCitationId}
          onSelectClaim={setSelectedClaim}
        />
        <ClaimInspector claim={selectedClaim} citation={selectedCitation} />
      </div>
      <aside>
        <CitationSidebar
          citations={report.citations}
          selectedCitationId={selectedCitationId}
          onSelectCitation={setSelectedCitationId}
        />
      </aside>
    </div>
  );
}
