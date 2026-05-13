import "server-only";

import { redirect } from "next/navigation";

import { getServerSupabaseClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export type UserContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof getServerSupabaseClient>>>;
  user: {
    id: string;
    email: string | null;
    user_metadata?: Record<string, unknown>;
  };
  accessToken: string | null;
};

export async function getOptionalUserContext(): Promise<UserContext | null> {
  const supabase = await getServerSupabaseClient();
  if (!supabase) return null;

  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

  if (!user) return null;

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
      user_metadata:
        typeof user.user_metadata === "object" && user.user_metadata !== null
          ? (user.user_metadata as Record<string, unknown>)
          : undefined,
    },
    accessToken: session?.access_token ?? null,
  };
}

export async function requireUserContext(): Promise<UserContext> {
  const context = await getOptionalUserContext();
  if (!context) {
    redirect(LOGIN_PATH);
  }
  return context;
}

export async function requireAccessToken() {
  const context = await requireUserContext();
  if (!context.accessToken) {
    redirect(LOGIN_PATH);
  }
  return context;
}
