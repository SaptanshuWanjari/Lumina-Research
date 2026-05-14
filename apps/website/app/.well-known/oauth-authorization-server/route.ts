import { getSupabaseAuthBaseUrl } from "@/lib/site-config";

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstream metadata failed: ${response.status}`);
  }

  return response.json();
}

export async function GET() {
  const authBaseUrl = getSupabaseAuthBaseUrl();
  if (!authBaseUrl) {
    return Response.json(
      {
        error: "Supabase auth is not configured",
      },
      { status: 503 },
    );
  }

  try {
    const document = await fetchJson(
      `${authBaseUrl}/.well-known/oauth-authorization-server`,
    );

    return Response.json(document, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch {
    return Response.json(
      {
        issuer: authBaseUrl,
        authorization_endpoint: `${authBaseUrl}/authorize`,
        token_endpoint: `${authBaseUrl}/token`,
        jwks_uri: `${authBaseUrl}/.well-known/jwks.json`,
        grant_types_supported: ["authorization_code", "refresh_token"],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      },
    );
  }
}
