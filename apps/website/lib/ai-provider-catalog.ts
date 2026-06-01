export const AI_PROVIDER_CATALOG = {
  gemini: {
    label: "Google Gemini",
    requiresApiKey: true,
    apiKeyLabel: "Gemini API Key",
    apiKeyPlaceholder: "AIza...",
    description: "Hosted Gemini models for planning, analysis, and report drafting.",
    models: [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
    ],
  },
  groq: {
    label: "Groq",
    requiresApiKey: true,
    apiKeyLabel: "Groq API Key",
    apiKeyPlaceholder: "gsk_...",
    description: "Groq-hosted models optimized for fast inference.",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"],
  },
} as const;

export type AiProvider = keyof typeof AI_PROVIDER_CATALOG;

export function listAiProviders(): AiProvider[] {
  return Object.keys(AI_PROVIDER_CATALOG) as AiProvider[];
}

export function isAiProvider(value: string): value is AiProvider {
  return value in AI_PROVIDER_CATALOG;
}

export function listModelsForProvider(provider: AiProvider): string[] {
  return [...AI_PROVIDER_CATALOG[provider].models];
}

export function isValidProviderModel(provider: AiProvider, model: string) {
  return (AI_PROVIDER_CATALOG[provider].models as readonly string[]).includes(model);
}

export function defaultModelForProvider(provider: AiProvider) {
  return AI_PROVIDER_CATALOG[provider].models[0];
}
