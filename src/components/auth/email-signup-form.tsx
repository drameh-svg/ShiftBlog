"use client";

import { useActionState, useState } from "react";
import { publicSignInAction, signUpAction } from "@/app/actions/auth";

export function EmailSignupForm({
  next = "/involve",
  compact = false,
}: {
  next?: string;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [signUpState, signUp, signingUp] = useActionState(signUpAction, undefined);
  const [signInState, signIn, signingIn] = useActionState(publicSignInAction, undefined);
  const pending = signingUp || signingIn;
  const state = mode === "signup" ? signUpState : signInState;

  return (
    <div className={compact ? "" : "mx-auto max-w-md px-4 py-16"}>
      {!compact && (
        <>
          <h1 className="display text-4xl">{mode === "signup" ? "Sign up with email" : "Sign in"}</h1>
          <p className="mt-3 text-sm text-muted">
            Use your email so SHIFT can record your Get Involved poll answer on the editorial spreadsheet.
          </p>
        </>
      )}
      {mode === "signup" ? (
        <form action={signUp} className={`${compact ? "mt-4" : "mt-6"} space-y-4`}>
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm">
            Name
            <input name="name" required minLength={2} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
          </label>
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
          </label>
          <label className="block text-sm">
            Password
            <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
          </label>
          {state && "error" in state && state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          {state && "message" in state && state.message ? <p className="text-sm text-lime">{state.message}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-fg py-3 text-sm text-bg">
            {pending ? "Saving…" : "Create account"}
          </button>
        </form>
      ) : (
        <form action={signIn} className={`${compact ? "mt-4" : "mt-6"} space-y-4`}>
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
          </label>
          <label className="block text-sm">
            Password
            <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
          </label>
          {state && "error" in state && state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-fg py-3 text-sm text-bg">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}
      <button
        type="button"
        className="mt-4 text-sm text-purple"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
      >
        {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </div>
  );
}
