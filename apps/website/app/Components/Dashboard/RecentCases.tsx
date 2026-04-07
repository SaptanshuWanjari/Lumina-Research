import Link from "next/link";

import ActionMenu from "@/app/Components/Common/ActionMenu";
import ListCard from "@/app/Components/Common/ListCard";
import StatusChip from "@/app/Components/Common/StatusChip";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FolderOpen } from "lucide-react";
import { dashboardRecentCases, type DashboardRecentCase } from "@/lib/mock-dashboard";

interface RecentCasesProps {
  cases?: DashboardRecentCase[];
  showViewAll?: boolean;
}

const statusTone = {
  RUNNING: "info",
  INGESTING: "warn",
  READY: "neutral",
} as const;

const statusLabel = {
  RUNNING: "RUNNING",
  INGESTING: "INGESTING",
  READY: "READY",
};

const RecentCases = ({
  cases = dashboardRecentCases,
  showViewAll = true,
}: RecentCasesProps) => {
  return (
    <ListCard
      title="Recent Cases"
      action={
        showViewAll ? (
          <Button variant="ghost" asChild className="rounded-[13px] px-4 text-sm font-medium text-slate-600">
            <Link href="/cases/research-desk">View All</Link>
          </Button>
        ) : null
      }
      bodyClassName="space-y-1"
    >
      {cases.length === 0 ? (
        <Empty className="border border-slate-200 bg-slate-50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No recent cases yet</EmptyTitle>
            <EmptyDescription>
              Start a case to track source intake, runs, and report drafts from one place.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_120px_120px_48px] gap-4 border-b border-slate-200 pb-3">
          <div className="text-[14px] font-semibold tracking-widest text-slate-500 uppercase">
            Case Title
          </div>
          <div className="text-[14px] font-semibold tracking-widest text-slate-500 uppercase">
            Status
          </div>
          <div className="text-[14px] font-semibold tracking-widest text-slate-500 uppercase">
            Last Updated
          </div>
          <div></div>
          </div>

          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="grid grid-cols-[1fr_120px_120px_48px] gap-4 rounded-lg border-b border-slate-100 py-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex flex-col gap-1">
                <Link href={caseItem.href} className="font-medium text-slate-800 text-[15px] leading-tight">
                  {caseItem.title}
                </Link>
                <p className="text-xs text-slate-500">{caseItem.subtitle}</p>
              </div>

              <div className="flex items-center">
                <StatusChip tone={statusTone[caseItem.status]}>
                  {statusLabel[caseItem.status]}
                </StatusChip>
              </div>

              <div className="flex items-center">
                <p className="text-sm text-slate-600">{caseItem.lastUpdated}</p>
              </div>

              <div className="flex items-center justify-center">
                <ActionMenu
                  items={[
                    { label: "Open case", href: caseItem.href },
                    { label: "Open report", href: "/report/fintech-uk-entry/overview" },
                    { label: "Open run", href: "/runs/rr-9942-x" },
                  ]}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </ListCard>
  );
};

export default RecentCases;
