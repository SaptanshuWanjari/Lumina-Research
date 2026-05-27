import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getRouteHandlerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.signup, request.url));
  }

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
  const redirectTo = new URL(
    error ? appRoutes.signup : redirectPath,
    request.url,
  );
  if (error) {
    redirectTo.searchParams.set("error", error.message);
    redirectTo.searchParams.set("redirectTo", redirectPath);
  }
  return NextResponse.redirect(redirectTo);
}
