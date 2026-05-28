"use client";

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

    const clonedContent = element.cloneNode(true) as HTMLElement;
    clonedContent.querySelectorAll("[data-export-ignore]").forEach((node) => {
      node.remove();
    });

    const iframe = document.createElement("iframe");
    iframe.title = "report-export";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    const printDocument = iframe.contentDocument;
    if (!printWindow || !printDocument) {
      iframe.remove();
      alert("Export failed: print frame unavailable.");
      return;
    }

    const headNodes = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]'),
    ).map((node) => node.cloneNode(true));

    printDocument.open();
    printDocument.write(
      `<!doctype html><html><head><title>${filenameBase}</title></head><body></body></html>`,
    );
    printDocument.close();

    for (const node of headNodes) {
      printDocument.head.appendChild(node);
    }

    const printStyles = printDocument.createElement("style");
    printStyles.textContent = `
      @page { size: A4; margin: 24mm; }
      body { background: #ffffff; color: #0f172a; }
      [data-export-ignore] { display: none !important; }
      .exporting-report { background: #ffffff !important; }
    `;
    printDocument.head.appendChild(printStyles);
    printDocument.body.appendChild(clonedContent);

    const finalizePrint = () => {
      printWindow.focus();
      printWindow.print();
      iframe.remove();
    };

    if (printDocument.fonts?.ready) {
      printDocument.fonts.ready.then(finalizePrint).catch(finalizePrint);
    } else {
      setTimeout(finalizePrint, 500);
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
