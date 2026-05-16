import { NextRequest, NextResponse } from "next/server";

import { requireAccessToken } from "@/lib/server/auth";
import { getCaseDetail } from "@/lib/server/data";
import { ServicesApiError, servicesApiFetch } from "@/lib/server/services-api";

type Params = { params: Promise<{ caseId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { caseId } = await params;
  const detail = await getCaseDetail(caseId);
  if (!detail) {
    return NextResponse.json({ detail: "Case not found" }, { status: 404 });
  }
  return NextResponse.json(detail.runs);
}

export async function POST(_: NextRequest, { params }: Params) {
  const { caseId } = await params;
  const { accessToken } = await requireAccessToken();
  try {
    const created = await servicesApiFetch(`/cases/${caseId}/runs`, accessToken!, {
      method: "POST",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ServicesApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { detail: "Failed to start run" },
      { status: 500 },
    );
  }
}
