import DashboardLayout from "@/app/Components/Layout/DashboardLayout";
import ModelDefaultsPanel from "@/app/Components/Settings/ModelDefaultsPanel";
import { getAiSettingsSummary } from "@/lib/server/ai-settings";

export default async function SettingsPage() {
  const aiSettings = await getAiSettingsSummary();

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5">
          <header>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
              Preferences
            </h1>
          </header>

          <section className="rounded-[13px] bg-white shadow-sm ring-1 ring-black/5">
            <div className="p-5 md:p-7">

              <ModelDefaultsPanel initialSettings={aiSettings} />
            </div>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}
