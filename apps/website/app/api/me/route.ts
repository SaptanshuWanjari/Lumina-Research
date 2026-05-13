import { NextResponse } from "next/server";

import { getMeSummary } from "@/lib/server/data";

export async function GET() {
  const me = await getMeSummary();
  return NextResponse.json(me);
}
