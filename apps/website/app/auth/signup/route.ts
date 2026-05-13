import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(appRoutes.signup, request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: new URL("/auth/callback", request.url).toString(),
    },
  });
  const redirectTo = new URL(error ? appRoutes.signup : appRoutes.dashboard, request.url);
  if (error) {
    redirectTo.searchParams.set("error", error.message);
  }
  return NextResponse.redirect(redirectTo);
}
