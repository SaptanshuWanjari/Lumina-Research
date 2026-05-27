import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  if (provider !== "google" && provider !== "github") {
    return NextResponse.redirect(new URL(appRoutes.login, request.url));
  }

  const redirectPath = resolveRedirectPath(
    request.nextUrl.searchParams.get("redirectTo"),
    appRoutes.dashboard,
  );

  const supabase = await getRouteHandlerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.login, request.url));
  }

  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("redirectTo", redirectPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    const redirectTo = new URL(appRoutes.login, request.url);
    if (error) {
      redirectTo.searchParams.set("error", error.message);
    }
    redirectTo.searchParams.set("redirectTo", redirectPath);
    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.redirect(data.url);
}
