import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await getServerSupabaseClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(appRoutes.dashboard, request.url));
}
