import { getBaseUrlFromRequest, toAbsoluteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  return Response.json(
    {
      serverInfo: {
        name: "lumina-research-website",
        version: "0.1.0",
      },
      transport: {
        type: "http",
        url: toAbsoluteUrl("/api/mcp", baseUrl),
      },
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
