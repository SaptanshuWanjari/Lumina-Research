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
  return NextResponse.json(detail.sources);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { caseId } = await params;
  const { accessToken } = await requireAccessToken();
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const incoming = await request.formData();
      const outgoing = new FormData();
      const file = incoming.get("file");
      if (file instanceof File) {
        outgoing.set("file", file);
      }
      const created = await servicesApiFetch(
        `/cases/${caseId}/sources`,
        accessToken!,
        {
          method: "POST",
          body: outgoing,
        },
      );
      return NextResponse.json(created, { status: 201 });
    }

    const body = await request.json();
    const created = await servicesApiFetch(
      `/cases/${caseId}/sources`,
      accessToken!,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ServicesApiError) {
      return NextResponse.json(
        { detail: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { detail: "Failed to add source" },
      { status: 500 },
    );
  }
}
