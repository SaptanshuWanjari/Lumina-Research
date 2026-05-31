import { NextRequest, NextResponse } from "next/server";

import { getReportDetail } from "@/lib/server/data";

type Params = { params: Promise<{ reportId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { reportId } = await params;
  const report = await getReportDetail(reportId);
  if (!report) {
    return NextResponse.json({ detail: "Report not found" }, { status: 404 });
  }
  return NextResponse.json(report);
}
