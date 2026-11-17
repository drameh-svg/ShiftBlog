"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/actions/auth";

export function SignInForm({ next = "" }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, undefined);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-4xl">Editorial desk</h1>
      <p className="mt-3 text-sm text-muted">
        Readers post anonymously and do not need an account. This sign-in is only for SHIFT editors publishing stories.
      </p>
      <form action={action} className="mt-8 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
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
          {pending ? "Signing in…" : "Open the desk"}
        </button>
      </form>
    </div>
  );
}
