import { NextRequest, NextResponse } from "next/server";

import {
  AI_PROVIDER_CATALOG,
  defaultModelForProvider,
  isAiProvider,
  isValidProviderModel,
} from "@/lib/ai-provider-catalog";
import { getAiSettingsSummary, updateAiSettings } from "@/lib/server/ai-settings";

export async function GET() {
  try {
    const settings = await getAiSettingsSummary();
    return NextResponse.json(settings);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to load AI settings";
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

    const current = await getAiSettingsSummary();
    const requiresProviderKey = AI_PROVIDER_CATALOG[provider].requiresApiKey;
    const nextReuse =
      typeof reuseApiKeyForEmbeddings === "boolean"
        ? reuseApiKeyForEmbeddings
        : current.reuseApiKeyForEmbeddings;
    const hasProviderKey = Boolean(apiKey) || current.hasStoredApiKey;
    const hasEmbeddingsKey = Boolean(embeddingsApiKey) || current.hasStoredEmbeddingsApiKey;

    if (requiresProviderKey && !apiKey && !clearApiKey && !current.hasStoredApiKey) {
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

    if (nextReuse) {
      if (provider !== "gemini") {
        return NextResponse.json(
          { detail: "Embeddings key reuse is only supported with Gemini." },
          { status: 400 },
        );
      }
      if (!hasProviderKey) {
        return NextResponse.json(
          { detail: "Embeddings require a stored Gemini API key." },
          { status: 400 },
        );
      }
    } else if (!hasEmbeddingsKey) {
      return NextResponse.json(
        { detail: "Embeddings require a stored API key." },
        { status: 400 },
      );
    }

    const settings = await updateAiSettings({
      provider,
      model,
      apiKey,
      clearApiKey,
      embeddingsApiKey,
      clearEmbeddingsApiKey,
      reuseApiKeyForEmbeddings: nextReuse,
    });
    return NextResponse.json(settings);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to save AI settings";
    const status = detail.includes("migration") ? 503 : 500;
    return NextResponse.json({ detail }, { status });
  }
}
