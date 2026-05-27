import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getRouteHandlerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.login, request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectPath = resolveRedirectPath(
    typeof formData.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : null,
    appRoutes.dashboard,
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  const redirectTo = new URL(
    error ? appRoutes.login : redirectPath,
    request.url,
  );
  if (error) {
    redirectTo.searchParams.set("error", error.message);
    redirectTo.searchParams.set("redirectTo", redirectPath);
  }
  return NextResponse.redirect(redirectTo);
}
