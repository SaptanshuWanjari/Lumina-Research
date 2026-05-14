export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "website",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
