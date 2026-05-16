import { NextRequest, NextResponse } from "next/server";

import {
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

    if (provider === "gemini" && !apiKey && !clearApiKey) {
      const current = await getAiSettingsSummary();
      if (!current.hasStoredApiKey) {
        return NextResponse.json(
          { detail: "Gemini requires an API key before saving." },
          { status: 400 },
        );
      }
    }

    if (provider === "gemini" && clearApiKey) {
      return NextResponse.json(
        { detail: "Gemini requires an API key. Save a replacement key instead." },
        { status: 400 },
      );
    }

    const settings = await updateAiSettings({ provider, model, apiKey, clearApiKey });
    return NextResponse.json(settings);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to save AI settings";
    const status = detail.includes("migration") ? 503 : 500;
    return NextResponse.json({ detail }, { status });
  }
}
