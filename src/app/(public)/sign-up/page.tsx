import { redirect } from "next/navigation";
import { EmailSignupForm } from "@/components/auth/email-signup-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Search } from "@/lib/page-props";

export default async function SignUpPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/involve";
  const user = await getCurrentUser();
  if (user) redirect(next.startsWith("/") ? next : "/involve");

  return (
    <div>
      {!isSupabaseConfigured() && (
        <p className="mx-auto max-w-md px-4 pt-16 text-sm text-danger">
          Email signup needs a Supabase project. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </p>
      )}
      <EmailSignupForm next={next} />
    </div>
  );
}
