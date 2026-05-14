import { getOpenApiDocument } from "@/lib/api-discovery";

export async function GET() {
  return Response.json(getOpenApiDocument(), {
    status: 200,
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
