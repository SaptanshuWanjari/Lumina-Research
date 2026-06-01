import { getBaseUrlFromRequest, toAbsoluteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  return Response.json(
    {
      resource: toAbsoluteUrl("/api", baseUrl),
      authorization_servers: [toAbsoluteUrl("/.well-known/openid-configuration", baseUrl)],
      bearer_methods_supported: ["header", "cookie"],
      scopes_supported: ["openid", "email", "profile"],
      resource_documentation: toAbsoluteUrl("/docs/api", baseUrl),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
