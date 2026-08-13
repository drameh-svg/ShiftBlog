import Link from "next/link";
import { Atmosphere } from "@/components/layout/atmosphere";

export default function SubmitPage() {
  return (
    <div className="relative overflow-hidden">
      <Atmosphere />
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Submit</p>
        <h1 className="display mt-3 max-w-3xl text-5xl">Have something SHIFT should take seriously?</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Two paths. One editorial desk. Every submission is reviewed by SHIFT Public Policy before anything is published.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link href="/submit/idea" className="card-hover rounded-[1.6rem] border border-line bg-bg-elevated/70 p-7">
            <p className="text-[11px] uppercase tracking-[0.16em] text-purple">Path one</p>
            <h2 className="display mt-3 text-3xl">Submit an Idea</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              A campus issue, a policy question, a debate, a story we should investigate. You do not need a finished draft.
            </p>
            <p className="mt-6 text-sm text-purple">Submit an Idea →</p>
          </Link>
          <Link href="/submit/writing" className="card-hover rounded-[1.6rem] border border-line bg-bg-elevated/70 p-7">
            <p className="text-[11px] uppercase tracking-[0.16em] text-lime">Path two</p>
            <h2 className="display mt-3 text-3xl">Submit Your Writing</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Opinion, analysis, explainers, campus reporting, interviews, research. Pitch plus draft, then editorial review.
            </p>
            <p className="mt-6 text-sm text-lime">Write for SHIFT →</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
