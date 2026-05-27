import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectPath = resolveRedirectPath(
    request.nextUrl.searchParams.get("redirectTo"),
    appRoutes.dashboard,
  );
  if (code) {
    const supabase = await getRouteHandlerSupabaseClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
