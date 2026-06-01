"use client";

import { useMemo, useState } from "react";

import {
  AI_PROVIDER_CATALOG,
  defaultModelForProvider,
  listAiProviders,
  listModelsForProvider,
  type AiProvider,
} from "@/lib/ai-provider-catalog";
import type { AiSettingsSummary, AllAiSettingsSummary } from "@/lib/server/ai-settings";
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
  initialSettings: AllAiSettingsSummary;
};

export default function ModelDefaultsPanel({
  initialSettings,
}: ModelDefaultsPanelProps) {
  const [activeSettings, setActiveSettings] = useState(initialSettings.active);
  const [allProviders, setAllProviders] = useState(initialSettings.providers);

  const [provider, setProvider] = useState<AiProvider>(initialSettings.active.provider);

  const currentProviderSettings = allProviders[provider] ?? {
    provider,
    model: defaultModelForProvider(provider),
    hasStoredApiKey: false,
    apiKeyLastFour: null,
    hasStoredEmbeddingsApiKey: false,
    embeddingsApiKeyLastFour: null,
    reuseApiKeyForEmbeddings: provider === "gemini",
    updatedAt: null,
  };

  const [model, setModel] = useState(currentProviderSettings.model);
  const [apiKey, setApiKey] = useState("");
  const [embeddingsApiKey, setEmbeddingsApiKey] = useState("");
  const [reuseEmbeddingsKey, setReuseEmbeddingsKey] = useState(
    currentProviderSettings.reuseApiKeyForEmbeddings,
  );
  const [clearStoredApiKey, setClearStoredApiKey] = useState(false);
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
          embeddingsApiKey,
          reuseApiKeyForEmbeddings: reuseEmbeddingsKey,
          clearApiKey: clearStoredApiKey,
        }),
      });

      const payload = (await response.json()) as
        | AllAiSettingsSummary
        | { detail?: string };

      if (!response.ok) {
        throw new Error(
          typeof payload === "object" && payload && "detail" in payload
            ? String(payload.detail ?? "Failed to save AI settings.")
            : "Failed to save AI settings.",
        );
      }

      const nextAllSettings = payload as AllAiSettingsSummary;
      setActiveSettings(nextAllSettings.active);
      setAllProviders(nextAllSettings.providers);
      setApiKey("");
      setEmbeddingsApiKey("");
      setReuseEmbeddingsKey(
        nextAllSettings.providers[provider]?.reuseApiKeyForEmbeddings ?? (provider === "gemini"),
      );
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
          Pick the provider and model for future planner, analyzer and writer runs.
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
                  
                  const settings = allProviders[nextProvider] ?? {
                    model: defaultModelForProvider(nextProvider),
                    reuseApiKeyForEmbeddings: nextProvider === "gemini",
                  };
                  setModel(settings.model);
                  setClearStoredApiKey(false);
                  setReuseEmbeddingsKey(settings.reuseApiKeyForEmbeddings);
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
              {currentProviderSettings.hasStoredApiKey ? (
                <p className="text-xs text-slate-500">
                  Stored: ••••{currentProviderSettings.apiKeyLastFour ?? "saved"}
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
                  disabled={!currentProviderSettings.hasStoredApiKey}
                />
                Remove any previously stored remote-provider key.
              </label>
            )}
          </div>

          <div className="space-y-3 rounded-[16px] border border-slate-200 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">Embeddings key</p>
              {currentProviderSettings.hasStoredEmbeddingsApiKey ? (
                <p className="text-xs text-slate-500">
                  Stored: ••••{currentProviderSettings.embeddingsApiKeyLastFour ?? "saved"}
                </p>
              ) : (
                <p className="text-xs text-slate-500">No key stored</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300"
                checked={reuseEmbeddingsKey}
                onChange={(event) => {
                  setReuseEmbeddingsKey(event.target.checked);
                  setMessage(null);
                  setError(null);
                }}
                disabled={provider !== "gemini"}
              />
              Use the same Gemini key for embeddings.
            </label>
            {provider !== "gemini" ? (
              <p className="text-xs text-slate-500">
                Embeddings currently use Gemini; provide a Gemini key below.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {reuseEmbeddingsKey
                  ? "Embeddings will reuse the main Gemini key."
                  : "Store a separate Gemini key for embeddings."}
              </p>
            )}

            {!reuseEmbeddingsKey ? (
              <Input
                value={embeddingsApiKey}
                onChange={(event) => {
                  setEmbeddingsApiKey(event.target.value);
                  setMessage(null);
                  setError(null);
                }}
                type="password"
                autoComplete="off"
                placeholder="AIza..."
                className="h-11 rounded-full border-slate-200 bg-white px-4"
              />
            ) : null}
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
                {AI_PROVIDER_CATALOG[activeSettings.provider].label}
              </dd>
            </div>
            <div className="rounded-[13px] border border-slate-200 bg-slate-50 p-3">
              <dt className="text-slate-500">Model</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {activeSettings.model}
              </dd>
            </div>
            <div className="rounded-[13px] border border-slate-200 bg-slate-50 p-3">
              <dt className="text-slate-500">Stored key</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {activeSettings.hasStoredApiKey
                  ? `••••${activeSettings.apiKeyLastFour ?? ""}`
                  : "None"}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  );
}
