"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";

export default function SignInPage() {
  const [state, action, pending] = useActionState(signInAction, undefined);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-4xl">Sign in</h1>
      <p className="mt-3 text-sm text-muted">
        Public accounts can comment, discuss, and submit. Editorial access is limited to approved SHIFT Public Policy team members.
      </p>
      <form action={action} className="mt-8 space-y-4">
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
        </label>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-full bg-fg py-3 text-sm text-bg">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        New here? <Link href="/sign-up" className="text-purple">Create a public account</Link>
      </p>
    </div>
  );
}
