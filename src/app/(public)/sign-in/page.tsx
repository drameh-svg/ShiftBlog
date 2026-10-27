import { SignInForm } from "@/components/auth/sign-in-form";
import type { Search } from "@/lib/page-props";

export default async function SignInPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  return <SignInForm next={next} />;
}
