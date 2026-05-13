import { NextRequest, NextResponse } from "next/server";

import { getRunDetail } from "@/lib/server/data";

type Params = { params: Promise<{ caseId: string; runId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { caseId, runId } = await params;
  const detail = await getRunDetail(runId);
  if (!detail || detail.caseItem.id !== caseId) {
    return NextResponse.json({ detail: "Run not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
