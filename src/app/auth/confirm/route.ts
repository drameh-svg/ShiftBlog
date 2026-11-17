import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncPublicUser } from "@/lib/public-user";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/involve";
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/involve";

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
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
