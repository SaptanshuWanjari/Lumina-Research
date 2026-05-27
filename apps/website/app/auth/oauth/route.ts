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
  
  // Do not append query parameters to the callback URL. Supabase/Providers often reject redirect URIs 
  // with dynamic query strings, causing a fallback to the default Site URL.
  const callbackUrl = new URL("/auth/callback", request.url);

  // Initialize a response object so Supabase can set cookies (like the PKCE code_verifier)
  const response = NextResponse.next();
  const supabase = await getRouteHandlerSupabaseClient(request, response);
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.login, request.url));
  }

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

  // Create the actual redirect response
  const redirectResponse = NextResponse.redirect(data.url);
  
  // Store the intended redirect path in a cookie instead of the URL query string
  redirectResponse.cookies.set("oauth_redirect", redirectPath, { 
    path: "/", 
    maxAge: 3600, 
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  
  // CRITICAL: We must copy the cookies (PKCE code-verifier) from the initial response 
  // over to the new redirect response, including all options!
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set({
      ...cookie
    });
  });

  return redirectResponse;
}
