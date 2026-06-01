import { getBaseUrlFromRequest } from "@/lib/site-config";
import { getOpenApiDocument } from "@/lib/api-discovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  return Response.json(getOpenApiDocument(baseUrl), {
    status: 200,
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
