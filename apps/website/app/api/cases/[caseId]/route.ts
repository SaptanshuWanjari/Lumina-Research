import { NextRequest, NextResponse } from "next/server";

import { requireUserContext } from "@/lib/server/auth";
import { getCaseDetail } from "@/lib/server/data";

type Params = { params: Promise<{ caseId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { caseId } = await params;
  const detail = await getCaseDetail(caseId);
  if (!detail) {
    return NextResponse.json({ detail: "Case not found" }, { status: 404 });
  }
  return NextResponse.json(detail.caseItem);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { caseId } = await params;
  const { supabase, user } = await requireUserContext();
  const body = await request.json();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.title === "string") payload.title = body.title.trim();
  if (typeof body.question === "string" || body.question === null) {
    payload.question =
      typeof body.question === "string" && body.question.trim()
        ? body.question.trim()
        : null;
  }
  if (typeof body.summary === "string" || body.summary === null) {
    payload.summary =
      typeof body.summary === "string" && body.summary.trim()
        ? body.summary.trim()
        : null;
  }
  if (typeof body.status === "string") payload.status = body.status;
  if (typeof body.priority === "string") payload.priority = body.priority;
  if (Array.isArray(body.tags)) {
    payload.tags = body.tags.filter(
      (item: unknown): item is string => typeof item === "string",
    );
  }

  const { data, error } = await supabase
    .from("cases")
    .update(payload)
    .eq("id", caseId)
    .eq("owner_user_id", user.id)
    .is("archived_at", null)
    .select(
      "id,title,question,summary,status,priority,tags,owner_user_id,created_at,updated_at,archived_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  const updated = {
    ...data,
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { caseId } = await params;
  const { supabase, user } = await requireUserContext();

  const { error } = await supabase
    .from("cases")
    .delete()
    .eq("id", caseId)
    .eq("owner_user_id", user.id);

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
