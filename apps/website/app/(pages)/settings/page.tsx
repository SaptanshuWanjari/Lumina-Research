// "use client";
import Link from "next/link";
import {
  BrainCircuit,
  Database,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ModelDefaultsPanel from "@/app/Components/Settings/ModelDefaultsPanel";
import LocalPathsTable from "@/app/Components/Settings/LocalPathsTable";
import { ClearCacheButton } from "@/app/Components/Settings/ClearCacheButton";

type SettingsSection = "general" | "models" | "security" | "data";

const SETTINGS_SECTIONS: SettingsSection[] = [
  "general",
  "models",
  "security",
  "data",
];

function normalizeSection(value?: string | string[]): SettingsSection {
  const parsed = Array.isArray(value) ? value[0] : value;
  if (parsed && SETTINGS_SECTIONS.includes(parsed as SettingsSection)) {
    return parsed as SettingsSection;
  }
  return "general";
}

function sectionIcon(section: SettingsSection) {
  if (section === "general") return <SlidersHorizontal className="size-4" />;
  if (section === "models") return <BrainCircuit className="size-4" />;
  if (section === "security") return <ShieldCheck className="size-4" />;
  return <Database className="size-4" />;
}

export default async function SettingsPage(props: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;

  const section = normalizeSection(searchParams.section);
  const sources = [
    {
      name: "Market Data",
      path: "./datasets/market",
      description: "Local CSV and parquet inputs",
      status: "ACTIVE" as const,
    },
    {
      name: "Research Notes",
      path: "./notes/research",
      description: "Local markdown and text notes",
      status: "INDEXED" as const,
    },
  ];
  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5">
          <header>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Preferences
            </h1>
            <p className="mt-2 text-slate-600">
              Local controls for analysis defaults, model behavior, and stored
              data.
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
                        {item}
                      </Link>
                    );
                  })}
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <ClearCacheButton />
                  </div>
                </nav>

                {/* <div className="mt-8 rounded-xl bg-rose-50 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.14em] text-rose-700">
                    LOCAL RESET
                  </p>
                  <p className="mt-1 text-xs text-rose-600">
                    Clearing caches and traces affects only this installation.
                  </p>
                </div> */}
              </aside>

              <div className="p-5 md:p-7">
                {section === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-semibold text-slate-900">
                        General
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Core defaults for your local research environment.
                      </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-lg font-semibold text-slate-800">
                          Research Desk Name
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Current profile label used across cases and reports.
                        </p>
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          Local Analyst
                        </p>
                      </article>
                      <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-lg font-semibold text-slate-800">
                          Default Storage Path
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Research artifacts are written under the local project
                          directory.
                        </p>
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          `/analysis/local-store`
                        </p>
                      </article>
                    </div>
                  </div>
                )}

                {section === "models" && (
                  <ModelDefaultsPanel />
                )}

                {section === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-semibold text-slate-900">
                        Security
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Local privacy defaults and trace retention behavior.
                      </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-lg font-semibold text-slate-800">
                          Trace Retention
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Keep run traces for 30 days before archival.
                        </p>
                      </article>
                      <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-lg font-semibold text-slate-800">
                          Local Encryption
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Sensitive cached source text is encrypted at rest.
                        </p>
                      </article>
                    </div>
                  </div>
                )}

                {section === "data" && (
                  <LocalPathsTable initialSources={sources} />
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}
