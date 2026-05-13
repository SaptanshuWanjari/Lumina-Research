import { NextRequest, NextResponse } from "next/server";

import { getSourceDetail } from "@/lib/server/data";

type Params = { params: Promise<{ caseId: string; sourceId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { caseId, sourceId } = await params;
  const detail = await getSourceDetail(caseId, sourceId);
  if (!detail) {
    return NextResponse.json({ detail: "Source not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
