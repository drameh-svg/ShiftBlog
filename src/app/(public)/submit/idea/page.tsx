"use client";

import { useActionState } from "react";
import { submitIdeaAction } from "@/app/actions/submissions";

export default function SubmitIdeaPage() {
  const [state, action, pending] = useActionState(submitIdeaAction, undefined);
  if (state?.ok) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="display text-4xl">We have the idea.</h1>
        <p className="mt-4 text-muted">
          SHIFT Public Policy editors will review it. If we pursue it, we may follow up at the email you provided — unless you asked to stay anonymous.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Submit an Idea</h1>
      <p className="mt-3 text-muted">Story ideas, campus issues, policy questions, debate topics, research, events, or something you think is being ignored.</p>
      <form action={action} className="mt-8 space-y-4">
        <Field name="name" label="Name" required />
        <Field name="email" label="USC email if applicable" type="email" />
        <Field name="topic" label="Topic" required />
        <label className="block text-sm">
          Category
          <select name="category" className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" defaultValue="Story ideas">
            {["Story ideas", "Campus issues", "Policy questions", "Debate topics", "Research", "Events", "Ignored issues"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Field name="idea" label="What’s your idea?" textarea required />
        <Field name="why" label="Why does this matter?" textarea required />
        <Field name="links" label="Supporting links" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="anonymous" />
          Submit anonymously where appropriate
        </label>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="rounded-full bg-fg px-5 py-3 text-sm text-bg">
          {pending ? "Sending…" : "Submit idea"}
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
        <textarea name={name} required={required} rows={5} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
      ) : (
        <input name={name} type={type} required={required} className="mt-1 w-full rounded-xl border border-line bg-transparent px-3 py-2" />
      )}
    </label>
  );
}
