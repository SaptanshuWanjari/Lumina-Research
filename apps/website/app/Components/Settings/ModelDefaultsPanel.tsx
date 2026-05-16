"use client";

import { useMemo, useState } from "react";

import {
  AI_PROVIDER_CATALOG,
  defaultModelForProvider,
  listAiProviders,
  listModelsForProvider,
  type AiProvider,
} from "@/lib/ai-provider-catalog";
import type { AiSettingsSummary } from "@/lib/server/ai-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ModelDefaultsPanelProps = {
  initialSettings: AiSettingsSummary;
};

export default function ModelDefaultsPanel({
  initialSettings,
}: ModelDefaultsPanelProps) {
  const [provider, setProvider] = useState<AiProvider>(initialSettings.provider);
  const [model, setModel] = useState(initialSettings.model);
  const [apiKey, setApiKey] = useState("");
  const [clearStoredApiKey, setClearStoredApiKey] = useState(false);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const providerConfig = AI_PROVIDER_CATALOG[provider];
  const modelOptions = useMemo(() => listModelsForProvider(provider), [provider]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          clearApiKey: clearStoredApiKey,
        }),
      });

      const payload = (await response.json()) as
        | AiSettingsSummary
        | { detail?: string };

      if (!response.ok) {
        throw new Error(
          typeof payload === "object" && payload && "detail" in payload
            ? String(payload.detail ?? "Failed to save AI settings.")
            : "Failed to save AI settings.",
        );
      }

      const nextSettings = payload as AiSettingsSummary;
      setSavedSettings(nextSettings);
      setApiKey("");
      setClearStoredApiKey(false);
      setMessage("AI settings saved. New runs will use this provider and model.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save AI settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">AI Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick the provider and model for future planner, analyzer, and writer runs.
        </p>
      </div>

      {message ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertTitle>Settings saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert className="border-rose-200 bg-rose-50 text-rose-900">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="space-y-5 rounded-[16px] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Provider</p>
              <Select
                value={provider}
                onValueChange={(value) => {
                  const nextProvider = value as AiProvider;
                  setProvider(nextProvider);
                  setModel(defaultModelForProvider(nextProvider));
                  setClearStoredApiKey(false);
                  setMessage(null);
                  setError(null);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-full border border-slate-200 bg-white px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listAiProviders().map((item) => (
                    <SelectItem key={item} value={item}>
                      {AI_PROVIDER_CATALOG[item].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">{providerConfig.description}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Model</p>
              <Select
                value={model}
                onValueChange={(value) => {
                  setModel(value);
                  setMessage(null);
                  setError(null);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-full border border-slate-200 bg-white px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Available models update with the selected provider.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                {providerConfig.apiKeyLabel}
              </p>
              {savedSettings.hasStoredApiKey ? (
                <p className="text-xs text-slate-500">
                  Stored: ••••{savedSettings.apiKeyLastFour ?? "saved"}
                </p>
              ) : (
                <p className="text-xs text-slate-500">No key stored</p>
              )}
            </div>

            <Input
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
                if (event.target.value) setClearStoredApiKey(false);
                setMessage(null);
                setError(null);
              }}
              type="password"
              autoComplete="off"
              disabled={!providerConfig.requiresApiKey}
              placeholder={
                providerConfig.requiresApiKey
                  ? providerConfig.apiKeyPlaceholder
                  : "No API key required for this provider"
              }
              className="h-11 rounded-full border-slate-200 bg-white px-4"
            />

            {providerConfig.requiresApiKey ? (
              <p className="text-xs text-slate-500">
                Leave blank to keep the existing stored key unchanged.
              </p>
            ) : (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300"
                  checked={clearStoredApiKey}
                  onChange={(event) => {
                    setClearStoredApiKey(event.target.checked);
                    setMessage(null);
                    setError(null);
                  }}
                  disabled={!savedSettings.hasStoredApiKey}
                />
                Remove any previously stored remote-provider key.
              </label>
            )}
          </div>

          <Button
            className="h-11 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save AI Settings"}
          </Button>
        </article>

        <article className="space-y-3 rounded-[16px] border border-slate-200 bg-white p-5">
          <div>
            <p className="text-lg font-semibold text-slate-900">Current default</p>
            <p className="mt-1 text-sm text-slate-500">
              This configuration applies to newly started runs.
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="rounded-[13px] border border-slate-200 bg-slate-50 p-3">
              <dt className="text-slate-500">Provider</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {AI_PROVIDER_CATALOG[savedSettings.provider].label}
              </dd>
            </div>
            <div className="rounded-[13px] border border-slate-200 bg-slate-50 p-3">
              <dt className="text-slate-500">Model</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {savedSettings.model}
              </dd>
            </div>
            <div className="rounded-[13px] border border-slate-200 bg-slate-50 p-3">
              <dt className="text-slate-500">Stored key</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {savedSettings.hasStoredApiKey
                  ? `••••${savedSettings.apiKeyLastFour ?? ""}`
                  : "None"}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  );
}
