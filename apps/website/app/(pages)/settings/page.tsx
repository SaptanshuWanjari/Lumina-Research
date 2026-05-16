// "use client";
import Link from "next/link";
import { BrainCircuit, Database, ShieldCheck } from "lucide-react";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import ModelDefaultsPanel from "@/app/Components/Settings/ModelDefaultsPanel";
import { SecurityPanel } from "@/app/Components/Settings/SecurityPanel";
import LocalPathsTable from "@/app/Components/Settings/LocalPathsTable";
import { getAiSettingsSummary, listStorageLocations } from "@/lib/server/ai-settings";

type SettingsSection = "ai" | "security" | "data";

const SETTINGS_SECTIONS: SettingsSection[] = ["ai", "security", "data"];

function normalizeSection(value?: string | string[]): SettingsSection {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed && SETTINGS_SECTIONS.includes(parsed as SettingsSection)) {
    return parsed as SettingsSection;
  }
  return "ai";
}

function sectionIcon(section: SettingsSection) {
  if (section === "ai") return <BrainCircuit className="size-4" />;
  if (section === "security") return <ShieldCheck className="size-4" />;
  return <Database className="size-4" />;
}

export default async function SettingsPage(props: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const section = normalizeSection(searchParams.section);
  const [aiSettings, storageLocations] = await Promise.all([
    getAiSettingsSummary(),
    listStorageLocations(),
  ]);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5">
          <header>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Preferences
            </h1>
            <p className="mt-2 text-slate-600">
              Runtime configuration for AI providers, saved credentials, and data
              storage visibility.
            </p>
          </header>

          <section className="rounded-[13px] bg-white shadow-sm ring-1 ring-black/5">
            <div className="grid min-h-[650px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="border-b border-slate-200 p-4 md:border-b-0 md:border-r md:p-5">
                <nav className="space-y-1">
                  {SETTINGS_SECTIONS.map((item) => {
                    const active = item === section;
                    return (
                      <Link
                        key={item}
                        href={`/settings?section=${item}`}
                        className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                          active
                            ? "bg-sky-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {sectionIcon(item)}
                        {item === "ai" ? "AI" : item}
                      </Link>
                    );
                  })}
                </nav>
              </aside>

              <div className="p-5 md:p-7">
                {section === "ai" && <ModelDefaultsPanel initialSettings={aiSettings} />}

                {section === "security" && <SecurityPanel settings={aiSettings} />}

                {section === "data" && <LocalPathsTable locations={storageLocations} />}
              </div>
            </div>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}
