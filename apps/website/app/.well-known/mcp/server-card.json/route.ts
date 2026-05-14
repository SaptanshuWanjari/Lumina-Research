import { toAbsoluteUrl } from "@/lib/site-config";

export async function GET() {
  return Response.json(
    {
      serverInfo: {
        name: "lumina-research-website",
        version: "0.1.0",
      },
      transport: {
        type: "http",
        url: toAbsoluteUrl("/api/mcp"),
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
