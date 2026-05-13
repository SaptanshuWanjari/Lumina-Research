import { NextRequest, NextResponse } from "next/server";

import { searchWorkspace } from "@/lib/server/data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchWorkspace(query);
  return NextResponse.json(results);
}
