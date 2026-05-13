import "server-only";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const API_V1_PREFIX = "/api/v1";

function getApiBaseUrl() {
  return (
    process.env.SERVICES_API_BASE_URL ??
    process.env.NEXT_PUBLIC_SERVICES_API_BASE_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export class ServicesApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function servicesApiFetch<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const bodyIsFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!bodyIsFormData && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${API_V1_PREFIX}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : response.statusText;
    throw new ServicesApiError(response.status, detail);
  }

  return payload as T;
}
