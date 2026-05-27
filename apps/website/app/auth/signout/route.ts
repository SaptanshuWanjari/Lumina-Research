import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { getRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL(appRoutes.login, request.url));
  const supabase = await getRouteHandlerSupabaseClient(request, response);
  await supabase?.auth.signOut();
  return response;
}
