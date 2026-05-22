import { NextRequest, NextResponse } from "next/server";

import { requireAccessToken } from "@/lib/server/auth";
import { servicesApiFetch } from "@/lib/server/services-api";

type Params = { params: Promise<{ runId: string }> };

export async function POST(_: NextRequest, { params }: Params) {
  const { runId } = await params;
  const { accessToken } = await requireAccessToken();
  const updated = await servicesApiFetch(`/runs/${runId}/retry`, accessToken!, {
    method: "POST",
  });
  return NextResponse.json(updated);
}
