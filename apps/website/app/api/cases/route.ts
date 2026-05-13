import { NextRequest, NextResponse } from "next/server";

import { listCases } from "@/lib/server/data";
import { requireUserContext } from "@/lib/server/auth";

export async function GET() {
  const cases = await listCases();
  return NextResponse.json(cases);
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUserContext();
  const body = await request.json();

  const now = new Date().toISOString();
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
    owner_user_id: user.id,
    created_at: now,
    updated_at: now,
  };

  if (!payload.title) {
    return NextResponse.json({ detail: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cases")
    .insert(payload)
    .select(
      "id,title,question,summary,status,priority,tags,owner_user_id,created_at,updated_at,archived_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  const created = {
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
  return NextResponse.json(created, { status: 201 });
}
