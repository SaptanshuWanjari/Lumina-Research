import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { resolveRedirectPath } from "@/lib/server/redirects";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  console.log("[auth/callback] GET request started:", request.url);
  const code = request.nextUrl.searchParams.get("code");
  const errorParam = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");
  
  if (errorParam) {
    console.error("[auth/callback] Error from provider:", errorParam, errorDescription);
    const errUrl = new URL(appRoutes.login, request.url);
    errUrl.searchParams.set("error", errorDescription || errorParam);
    return NextResponse.redirect(errUrl);
  }

  const oauthRedirect = request.cookies.get("oauth_redirect")?.value;
  const redirectPath = resolveRedirectPath(
    request.nextUrl.searchParams.get("redirectTo") || oauthRedirect,
    appRoutes.dashboard,
  );
  
  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  
  // Clear the cookie now that we've used it
  response.cookies.delete("oauth_redirect");
  
  if (code) {
    console.log("[auth/callback] Exchanging code for session...");
    const supabase = await getRouteHandlerSupabaseClient(request, response);
    
    if (!supabase) {
      console.error("[auth/callback] Supabase client could not be initialized");
      const errUrl = new URL(appRoutes.login, request.url);
      errUrl.searchParams.set("error", "Supabase client not initialized");
      return NextResponse.redirect(errUrl);
    }
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error);
      const errUrl = new URL(appRoutes.login, request.url);
      errUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(errUrl);
    }
    
    console.log("[auth/callback] Session exchange successful! User ID:", data.user?.id);
  } else {
    console.warn("[auth/callback] No code found in URL");
  }
  
  return response;
}
