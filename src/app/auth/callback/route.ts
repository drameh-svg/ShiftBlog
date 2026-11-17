import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncPublicUser } from "@/lib/public-user";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/involve";
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/involve";

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user?.email) {
        await syncPublicUser({
          email: data.user.email,
          name: typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : null,
        });
      }
    }
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
