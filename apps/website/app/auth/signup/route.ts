import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const redirectPath = resolveRedirectPath(
    typeof formData.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : null,
    appRoutes.dashboard,
  );
  const emailRedirect = new URL("/auth/callback", request.url);
  emailRedirect.searchParams.set("redirectTo", redirectPath);

  const successResponse = NextResponse.redirect(new URL(redirectPath, request.url));
  const supabase = await getRouteHandlerSupabaseClient(request, successResponse);
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.signup, request.url));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: emailRedirect.toString(),
    },
  });
  if (error) {
    const errorRedirect = new URL(appRoutes.signup, request.url);
    errorRedirect.searchParams.set("error", error.message);
    errorRedirect.searchParams.set("redirectTo", redirectPath);
    return NextResponse.redirect(errorRedirect);
  }
  return successResponse;
}
