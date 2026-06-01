import "server-only";

import { defaultModelForProvider, isAiProvider, isValidProviderModel, type AiProvider } from "@/lib/ai-provider-catalog";
import { requireUserContext } from "@/lib/server/auth";
import { encryptSecret } from "@/lib/server/secretbox";

export type AiSettingsSummary = {
  provider: AiProvider;
  model: string;
  hasStoredApiKey: boolean;
  apiKeyLastFour: string | null;
  hasStoredEmbeddingsApiKey: boolean;
  embeddingsApiKeyLastFour: string | null;
  reuseApiKeyForEmbeddings: boolean;
  updatedAt: string | null;
};

export type StorageLocationSummary = {
  path: string;
  sourceCount: number;
};

export type AllAiSettingsSummary = {
  active: AiSettingsSummary;
  providers: Record<string, AiSettingsSummary>;
};

type AiSettingsRow = {
  provider: string | null;
  model: string | null;
  encrypted_api_key: string | null;
  api_key_last_four: string | null;
  encrypted_embeddings_api_key: string | null;
  embeddings_api_key_last_four: string | null;
  reuse_api_key_for_embeddings: boolean | null;
  updated_at: string | null;
};

function isMissingAiSettingsTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  return code === "PGRST205";
}

function rowToSummary(row: AiSettingsRow | null): AiSettingsSummary {
  const provider =
    row?.provider && isAiProvider(row.provider) ? row.provider : "gemini";
  const model =
    row?.model && isValidProviderModel(provider, row.model)
      ? row.model
      : defaultModelForProvider(provider);

  return {
    provider,
    model,
    hasStoredApiKey: Boolean(row?.encrypted_api_key),
    apiKeyLastFour: row?.api_key_last_four ?? null,
    hasStoredEmbeddingsApiKey: Boolean(row?.encrypted_embeddings_api_key),
    embeddingsApiKeyLastFour: row?.embeddings_api_key_last_four ?? null,
    reuseApiKeyForEmbeddings: row?.reuse_api_key_for_embeddings ?? true,
    updatedAt: row?.updated_at ?? null,
  };
}

export async function getAiSettingsSummary() {
  const { supabase, user } = await requireUserContext();
  const { data, error } = await supabase
    .from("ai_settings")
    .select(
      "provider,model,encrypted_api_key,api_key_last_four,encrypted_embeddings_api_key,embeddings_api_key_last_four,reuse_api_key_for_embeddings,updated_at",
    )
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingAiSettingsTableError(error)) {
      return rowToSummary(null);
    }
    throw error;
  }
  return rowToSummary((data as AiSettingsRow | null) ?? null);
}

export async function getAllAiSettings(): Promise<AllAiSettingsSummary> {
  const { supabase, user } = await requireUserContext();
  const { data, error } = await supabase
    .from("ai_settings")
    .select(
      "provider,model,encrypted_api_key,api_key_last_four,encrypted_embeddings_api_key,embeddings_api_key_last_four,reuse_api_key_for_embeddings,updated_at",
    )
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingAiSettingsTableError(error)) {
      return { active: rowToSummary(null), providers: {} };
    }
    throw error;
  }

  const rows = (data as AiSettingsRow[] | null) ?? [];
  const providers: Record<string, AiSettingsSummary> = {};
  for (const row of rows) {
    if (row.provider) {
      providers[row.provider] = rowToSummary(row);
    }
  }

  const active = rows.length > 0 ? rowToSummary(rows[0]) : rowToSummary(null);

  return { active, providers };
}

export async function updateAiSettings(input: {
  provider: AiProvider;
  model: string;
  apiKey?: string;
  clearApiKey?: boolean;
  embeddingsApiKey?: string;
  clearEmbeddingsApiKey?: boolean;
  reuseApiKeyForEmbeddings?: boolean;
}) {
  const { supabase, user } = await requireUserContext();
  const existingResp = await supabase
    .from("ai_settings")
    .select(
      "encrypted_api_key,encrypted_embeddings_api_key,reuse_api_key_for_embeddings",
    )
    .eq("owner_user_id", user.id)
    .eq("provider", input.provider)
    .maybeSingle();

  if (existingResp.error) {
    if (isMissingAiSettingsTableError(existingResp.error)) {
      throw new Error(
        "AI settings storage is not available yet. Run the latest database migration first.",
      );
    }
    throw existingResp.error;
  }

  const now = new Date().toISOString();
  const payload: Record<string, string | boolean | null> = {
    owner_user_id: user.id,
    provider: input.provider,
    model: input.model,
    updated_at: now,
  };

  if (input.clearApiKey) {
    payload.encrypted_api_key = null;
    payload.api_key_last_four = null;
  } else if (typeof input.apiKey === "string" && input.apiKey.trim()) {
    const trimmedApiKey = input.apiKey.trim();
    payload.encrypted_api_key = encryptSecret(trimmedApiKey);
    payload.api_key_last_four = trimmedApiKey.slice(-4);
  } else if (!existingResp.data) {
    payload.encrypted_api_key = null;
    payload.api_key_last_four = null;
  }

  if (typeof input.reuseApiKeyForEmbeddings === "boolean") {
    payload.reuse_api_key_for_embeddings = input.reuseApiKeyForEmbeddings;
  } else if (!existingResp.data) {
    payload.reuse_api_key_for_embeddings = true;
  }

  if (input.clearEmbeddingsApiKey) {
    payload.encrypted_embeddings_api_key = null;
    payload.embeddings_api_key_last_four = null;
  } else if (typeof input.embeddingsApiKey === "string" && input.embeddingsApiKey.trim()) {
    const trimmedEmbeddingsKey = input.embeddingsApiKey.trim();
    payload.encrypted_embeddings_api_key = encryptSecret(trimmedEmbeddingsKey);
    payload.embeddings_api_key_last_four = trimmedEmbeddingsKey.slice(-4);
  } else if (!existingResp.data) {
    payload.encrypted_embeddings_api_key = null;
    payload.embeddings_api_key_last_four = null;
  }

  let error;
  if (existingResp.data) {
    const { error: updateError } = await supabase
      .from("ai_settings")
      .update(payload)
      .eq("owner_user_id", user.id)
      .eq("provider", input.provider);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("ai_settings")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    if (isMissingAiSettingsTableError(error)) {
      throw new Error(
        "AI settings storage is not available yet. Run the latest database migration first.",
      );
    }
    throw error;
  }

  const { data, error: fetchError } = await supabase
    .from("ai_settings")
    .select(
      "provider,model,encrypted_api_key,api_key_last_four,encrypted_embeddings_api_key,embeddings_api_key_last_four,reuse_api_key_for_embeddings,updated_at",
    )
    .eq("owner_user_id", user.id)
    .eq("provider", input.provider)
    .maybeSingle();
  if (fetchError) {
    if (isMissingAiSettingsTableError(fetchError)) {
      return rowToSummary(null);
    }
    throw fetchError;
  }

  return rowToSummary((data as AiSettingsRow | null) ?? null);
}

export async function listStorageLocations(): Promise<StorageLocationSummary[]> {
  const { supabase, user } = await requireUserContext();
  const { data, error } = await supabase
    .from("sources")
    .select("storage_path")
    .eq("owner_user_id", user.id)
    .not("storage_path", "is", null);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const path =
      typeof row.storage_path === "string" ? row.storage_path.trim() : "";
    if (!path) continue;
    counts.set(path, (counts.get(path) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([path, sourceCount]) => ({ path, sourceCount }))
    .sort((left, right) => left.path.localeCompare(right.path));
}
