import { NextRequest, NextResponse } from "next/server";

import { listCases } from "@/lib/server/data";
import { requireAccessToken } from "@/lib/server/auth";
import { ServicesApiError, servicesApiFetch } from "@/lib/server/services-api";

export async function GET() {
  const cases = await listCases();
  return NextResponse.json(cases);
}

export async function POST(request: NextRequest) {
  const { accessToken } = await requireAccessToken();
  const body = await request.json();

  const payload = {
    title: String(body.title ?? "").trim(),
    question:
      typeof body.question === "string" && body.question.trim()
        ? body.question.trim()
        : null,
    summary:
      typeof body.summary === "string" && body.summary.trim()
        ? body.summary.trim()
        : null,
    priority:
      typeof body.priority === "string" && body.priority
        ? body.priority
        : "normal",
    tags: Array.isArray(body.tags)
      ? body.tags.filter((item: unknown): item is string => typeof item === "string")
      : [],
  };

  if (!payload.title) {
    return NextResponse.json({ detail: "title is required" }, { status: 400 });
  }

  try {
    const created = await servicesApiFetch("/cases", accessToken!, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ServicesApiError) {
      return NextResponse.json(
        { detail: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { detail: "Failed to create case" },
      { status: 500 },
    );
  }
}
