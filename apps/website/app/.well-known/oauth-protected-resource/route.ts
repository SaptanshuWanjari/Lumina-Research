import { toAbsoluteUrl } from "@/lib/site-config";

export async function GET() {
  return Response.json(
    {
      resource: toAbsoluteUrl("/api"),
      authorization_servers: [toAbsoluteUrl("/.well-known/openid-configuration")],
      bearer_methods_supported: ["header", "cookie"],
      scopes_supported: ["openid", "email", "profile"],
      resource_documentation: toAbsoluteUrl("/docs/api"),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
