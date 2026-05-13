import { NextRequest, NextResponse } from "next/server";

import { appRoutes } from "@/lib/app-routes";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient();
  await supabase?.auth.signOut();
  return NextResponse.redirect(new URL(appRoutes.login, request.url));
}
