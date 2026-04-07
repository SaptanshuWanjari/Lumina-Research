import type { Metadata } from "next";
import { Calendar, Clock3 } from "lucide-react";

import DashboardLayout from "../../../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ConfirmActionDialog from "@/app/Components/Dialogs/ConfirmActionDialog";
import StatusChip from "@/app/Components/Common/StatusChip";
import { findReport } from "@/lib/mock-reports";
import ReportWorkspace from "@/app/Components/Report/ReportWorkspace";
import { ReportActionButtons } from "@/app/Components/Report/ReportActionButtons";

export async function generateMetadata(
  props: PageProps<"/report/[id]/overview">,
): Promise<Metadata> {
  const { id } = await props.params;
  const report = findReport(id);
  return {
    title: `${report.title} · Report Overview`,
  };
}

export default async function ReportOverviewPage(
  props: PageProps<"/report/[id]/overview">,
) {
  const { id: reportId } = await props.params;
  const report = findReport(reportId);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-5">
          <header className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <StatusChip>{report.status}</StatusChip>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-slate-900">
                  {report.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {report.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-4" />
                    {report.readTime}
                  </span>
                  <Badge className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                    {report.version}
                  </Badge>
                </div>
              </div>

              <ReportActionButtons />
            </div>
          </header>

          <ReportWorkspace report={report} />
        </div>
      </section>
    </DashboardLayout>
  );
}
