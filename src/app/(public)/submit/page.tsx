import Link from "next/link";
import { Atmosphere } from "@/components/layout/atmosphere";

export default function SubmitPage() {
  return (
    <div className="relative overflow-hidden">
      <Atmosphere />
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Articles</p>
        <h1 className="display mt-3 max-w-3xl text-5xl">Stories are published by the SHIFT desk.</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
          Article uploads are handled by editors for now. A self-serve process is coming so the desk can publish without
          waiting on a developer. Readers can already discuss and get involved without an account.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/read" className="rounded-full bg-fg px-5 py-3 text-sm text-bg">
            Read stories →
          </Link>
          <Link href="/discuss" className="rounded-full border border-line px-5 py-3 text-sm">
            Join the discussion →
          </Link>
        </div>
      </div>
    </div>
  );
}
