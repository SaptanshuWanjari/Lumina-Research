import { getBaseUrlFromRequest } from "@/lib/site-config";
import { getApiCatalog } from "@/lib/api-discovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  return Response.json(getApiCatalog(baseUrl), {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
