import { NextResponse } from "next/server";

import { listReports } from "@/lib/server/data";

export async function GET() {
  const reports = await listReports();
  return NextResponse.json(reports);
}
