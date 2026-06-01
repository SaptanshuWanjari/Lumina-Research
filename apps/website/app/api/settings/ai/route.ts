import { NextRequest, NextResponse } from "next/server";

import {
  AI_PROVIDER_CATALOG,
  defaultModelForProvider,
  isAiProvider,
  isValidProviderModel,
} from "@/lib/ai-provider-catalog";
import { getAllAiSettings, updateAiSettings } from "@/lib/server/ai-settings";

export async function GET() {
  try {
    const settings = await getAllAiSettings();
    return NextResponse.json(settings);
  } catch (error) {
    const detail = toMessage(error, "Failed to load AI settings");
    return NextResponse.json({ detail }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const rawProvider = String(body.provider ?? "");

    if (!isAiProvider(rawProvider)) {
      return NextResponse.json({ detail: "Unsupported provider" }, { status: 400 });
    }

    const provider = rawProvider;
    const model =
      typeof body.model === "string" && isValidProviderModel(provider, body.model)
        ? body.model
        : defaultModelForProvider(provider);

    const apiKey =
      typeof body.apiKey === "string" && body.apiKey.trim()
        ? body.apiKey.trim()
        : undefined;
    const clearApiKey = body.clearApiKey === true;
    const embeddingsApiKey =
      typeof body.embeddingsApiKey === "string" && body.embeddingsApiKey.trim()
        ? body.embeddingsApiKey.trim()
        : undefined;
    const clearEmbeddingsApiKey = body.clearEmbeddingsApiKey === true;
    const reuseApiKeyForEmbeddings =
      typeof body.reuseApiKeyForEmbeddings === "boolean"
        ? body.reuseApiKeyForEmbeddings
        : undefined;

    // Fetch stored settings for just this provider.
    const all = await getAllAiSettings();
    const current = all.providers[provider] ?? {
      provider,
      model: defaultModelForProvider(provider),
      hasStoredApiKey: false,
      apiKeyLastFour: null,
      hasStoredEmbeddingsApiKey: false,
      embeddingsApiKeyLastFour: null,
      // Groq always requires a separate Gemini embeddings key — never reuse.
      reuseApiKeyForEmbeddings: provider === "gemini",
      updatedAt: null,
    };

    // --- Provider key validation ---
    const requiresProviderKey =
      AI_PROVIDER_CATALOG[provider as keyof typeof AI_PROVIDER_CATALOG].requiresApiKey;
    const hasProviderKey = Boolean(apiKey) || current.hasStoredApiKey;

    if (requiresProviderKey && !hasProviderKey) {
      return NextResponse.json(
        { detail: `${AI_PROVIDER_CATALOG[provider].label} requires an API key.` },
        { status: 400 },
      );
    }
    if (requiresProviderKey && clearApiKey) {
      return NextResponse.json(
        { detail: `${AI_PROVIDER_CATALOG[provider].label} requires an API key.` },
        { status: 400 },
      );
    }

    // --- Embeddings key validation ---
    // Groq can never reuse its own key for embeddings (no Groq embeddings model).
    const nextReuse =
      provider === "gemini"
        ? (typeof reuseApiKeyForEmbeddings === "boolean"
            ? reuseApiKeyForEmbeddings
            : current.reuseApiKeyForEmbeddings)
        : false;

    if (provider === "gemini" && nextReuse) {
      // Case 1 – Gemini + reuse same key: only need the Gemini API key (already validated above).
      if (!hasProviderKey) {
        return NextResponse.json(
          { detail: "A Gemini API key is required to use it for embeddings." },
          { status: 400 },
        );
      }
    } else {
      // Case 2 – Gemini + separate embeddings key, OR Case 3 – Groq.
      // A distinct Gemini embeddings key must be present (stored or being provided now).
      const clearsEmbeddingsKey = clearEmbeddingsApiKey && !embeddingsApiKey;
      const hasEmbeddingsKey =
        Boolean(embeddingsApiKey) ||
        (current.hasStoredEmbeddingsApiKey && !clearsEmbeddingsKey);

      if (!hasEmbeddingsKey) {
        const label = provider === "gemini" ? "a separate Gemini" : "a Gemini";
        return NextResponse.json(
          { detail: `Embeddings require ${label} API key. Please enter one below.` },
          { status: 400 },
        );
      }
    }

    await updateAiSettings({
      provider,
      model,
      apiKey,
      clearApiKey,
      embeddingsApiKey,
      clearEmbeddingsApiKey,
      reuseApiKeyForEmbeddings: nextReuse,
    });

    const updatedAll = await getAllAiSettings();
    return NextResponse.json(updatedAll);
  } catch (error) {
    const detail = toMessage(error, "Failed to save AI settings");
    const status = detail.includes("migration") ? 503 : 500;
    return NextResponse.json({ detail }, { status });
  }
}

/** Extract a human-readable message from any thrown value (Error or Supabase PostgRESTError). */
function toMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message || fallback;
  }
  return fallback;
}
