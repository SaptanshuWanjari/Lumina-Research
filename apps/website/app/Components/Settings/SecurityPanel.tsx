import type { AiSettingsSummary } from "@/lib/server/ai-settings";

type SecurityPanelProps = {
  settings: AiSettingsSummary;
};

export function SecurityPanel({ settings }: SecurityPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Credential Storage</h2>
        <p className="mt-1 text-sm text-slate-500">
          Saved provider credentials stay server-side and are never rendered back in full.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-lg font-semibold text-slate-900">At-rest protection</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            API keys are encrypted before they are written to the database. The UI only
            shows the last four characters so an existing secret can be identified
            without exposing it.
          </p>
        </article>

        <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-lg font-semibold text-slate-900">Current status</p>
          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <dt>Provider</dt>
              <dd className="font-semibold text-slate-900">{settings.provider}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Stored key</dt>
              <dd className="font-semibold text-slate-900">
                {settings.hasStoredApiKey
                  ? `Present (••••${settings.apiKeyLastFour ?? ""})`
                  : "Not stored"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Last updated</dt>
              <dd className="font-semibold text-slate-900">
                {settings.updatedAt
                  ? new Date(settings.updatedAt).toLocaleString()
                  : "Not saved yet"}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  );
}
