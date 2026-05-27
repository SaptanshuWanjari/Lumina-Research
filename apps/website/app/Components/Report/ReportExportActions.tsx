"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { slugifyFilename } from "@/lib/utils";

type ReportExportActionsProps = {
  caseTitle: string;
  reportTitle?: string | null;
  contentMarkdown?: string | null;
  summary?: string | null;
  exportTargetId?: string;
};

export function ReportExportActions({
  caseTitle,
  reportTitle,
  contentMarkdown,
  summary,
  exportTargetId = "report-export-content",
}: ReportExportActionsProps) {
  const filenameBase = slugifyFilename(caseTitle);
  const markdownBody =
    contentMarkdown?.trim() || summary?.trim() || "No report content available.";

  const handleMarkdownExport = () => {
    const content = reportTitle ? `# ${reportTitle}\n\n${markdownBody}\n` : `${markdownBody}\n`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filenameBase}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    const element = document.getElementById(exportTargetId);
    if (!element) {
      alert("Export failed: report content not found.");
      return;
    }

    document.body.classList.add("exporting-report");
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        ignoreElements: (el) => el.hasAttribute("data-export-ignore"),
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${filenameBase}.pdf`);
    } finally {
      document.body.classList.remove("exporting-report");
    }
  };

  return (
    <div className="flex flex-wrap gap-2" data-export-ignore>
      <Button
        onClick={handleMarkdownExport}
        variant="outline"
        className="h-9 rounded-full px-4 text-xs"
      >
        Download Markdown
      </Button>
      <Button
        onClick={handlePdfExport}
        className="h-9 rounded-full bg-slate-900 px-4 text-xs text-white hover:bg-slate-700"
      >
        Download PDF
      </Button>
    </div>
  );
}
