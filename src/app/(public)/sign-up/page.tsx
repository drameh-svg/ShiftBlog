"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, undefined);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-4xl">Create a SHIFT account</h1>
      <p className="mt-3 text-sm text-muted">
        A public account lets you comment, debate, save stories, and submit. It does not grant editorial access.
      </p>
      <form action={action} className="mt-8 space-y-4">
        <label className="block text-sm">
          Name
          <input name="name" required className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
        </label>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-full bg-fg py-3 text-sm text-bg">
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account? <Link href="/sign-in" className="text-purple">Sign in</Link>
      </p>
    </div>
  );
}
