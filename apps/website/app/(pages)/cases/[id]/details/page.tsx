import type { Metadata } from "next";

import DashboardLayout from "../../../../Components/Layout/DashboardLayout";
import SectionTabs from "@/app/Components/Common/SectionTabs";
import CaseActivityPanel from "@/app/Components/Cases/CaseActivityPanel";
import CaseControlCenter from "@/app/Components/Cases/CaseControlCenter";
import CaseDetailHero from "@/app/Components/Cases/CaseDetailHero";
import CaseDetailStats from "@/app/Components/Cases/CaseDetailStats";
import CaseOverviewPanel from "@/app/Components/Cases/CaseOverviewPanel";
import CaseRunsPanel from "@/app/Components/Cases/CaseRunsPanel";
import CaseSourcesPanel from "@/app/Components/Cases/CaseSourcesPanel";
import { ReportActionButtons } from "@/app/Components/Cases/ReportActionButtons";
import { Button } from "@/components/ui/button";
import { getCaseDetailById } from "@/lib/mock-cases";

type TabKey = "overview" | "sources" | "runs" | "report" | "history";

const TABS: TabKey[] = ["overview", "sources", "runs", "report", "history"];

function normalizeTab(value?: string | string[]): TabKey {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed && TABS.includes(parsed as TabKey)) {
    return parsed as TabKey;
  }

  return "overview";
}

export async function generateMetadata(
  props: PageProps<"/cases/[id]/details">
): Promise<Metadata> {
  const { id } = await props.params;
  const entry = getCaseDetailById(id);
  return {
    title: `${entry.title} · Case Details`,
  };
}

export default async function CaseDetailsPage(
  props: PageProps<"/cases/[id]/details">
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const activeTab = normalizeTab(searchParams.tab);
  const activeSourceId =
    typeof searchParams.source === "string" ? searchParams.source : undefined;
  const entry = getCaseDetailById(id);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,2.25fr)_330px]">
          <div className="space-y-6">
            <div>
              <CaseDetailHero entry={entry} />
              <CaseDetailStats stats={entry.stats} />
            </div>

            <SectionTabs
              value={activeTab}
              basePath={`/cases/${id}/details`}
              items={TABS.map((tab) => ({
                value: tab,
                label: tab.toUpperCase(),
              }))}
            />

            {activeTab === "overview" && <CaseOverviewPanel entry={entry} caseId={id} />}

            {activeTab === "sources" && (
              <CaseSourcesPanel
                caseId={id}
                sources={entry.sources}
                activeSourceId={activeSourceId}
              />
            )}

            {activeTab === "runs" && <CaseRunsPanel runs={entry.runs} />}

            {activeTab === "report" && (
              <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-800">Report</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Draft report is available with citations attached to each claim. Review and
                  publish when confidence thresholds are met.
                </p>
                <ReportActionButtons caseId={id} />
              </section>
            )}

            {activeTab === "history" && <CaseActivityPanel activity={entry.activity} />}
          </div>

          <aside>
            <CaseControlCenter entry={entry} caseId={id} />
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}
