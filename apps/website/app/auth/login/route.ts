import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectPath = resolveRedirectPath(
    typeof formData.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : null,
    appRoutes.dashboard,
  );

  const successResponse = NextResponse.redirect(new URL(redirectPath, request.url));
  const supabase = await getRouteHandlerSupabaseClient(request, successResponse);
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.login, request.url));
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const errorRedirect = new URL(appRoutes.login, request.url);
    errorRedirect.searchParams.set("error", error.message);
    errorRedirect.searchParams.set("redirectTo", redirectPath);
    return NextResponse.redirect(errorRedirect);
  }
  return successResponse;
}
