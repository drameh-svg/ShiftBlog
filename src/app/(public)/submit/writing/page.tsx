"use client";

import { useActionState } from "react";
import { submitWritingAction } from "@/app/actions/submissions";

export default function SubmitWritingPage() {
  const [state, action, pending] = useActionState(submitWritingAction, undefined);
  if (state?.ok) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="display text-4xl">Your writing is with the desk.</h1>
        <p className="mt-4 leading-7 text-muted">
          Every piece goes through SHIFT Public Policy’s editorial review process. Editors may accept it, ask for revision, or decline. You will hear from us at the email you provided. Publication is never automatic.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Submit Your Writing</h1>
      <p className="mt-3 text-muted">Opinion, analysis, explainer, campus, interview, research, or news commentary. Include a pitch and a draft.</p>
      <form action={action} className="mt-8 space-y-4">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="title" label="Proposed title" required />
        <label className="block text-sm">
          Article type
          <select name="articleType" className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2">
            {["Opinion", "Analysis", "Explainer", "Campus", "Interview", "Research", "News Commentary"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Field name="topic" label="Topic" required />
        <Field name="pitch" label="Short pitch" textarea required />
        <Field name="draft" label="Full draft" textarea required />
        <Field name="sources" label="Relevant sources / links" textarea />
        <Field name="bio" label="Short author bio" textarea required />
        <label className="block text-sm">
          Byline preference
          <select name="bylinePreference" className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2">
            <option value="named">Publish under my name</option>
            <option value="anonymous">Consider anonymous byline</option>
          </select>
        </label>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="rounded-full bg-fg px-5 py-3 text-sm text-bg">
          {pending ? "Sending…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  textarea,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      {textarea ? (
        <textarea name={name} required={required} rows={name === "draft" ? 10 : 4} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
      ) : (
        <input name={name} type={type} required={required} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
      )}
    </label>
  );
}
