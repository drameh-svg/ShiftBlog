import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">404</p>
      <h1 className="display mt-3 text-4xl">This page is not in the issue.</h1>
      <p className="mt-4 text-muted">The story may have moved, or the URL is incomplete.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-fg px-5 py-3 text-sm text-bg">
        Back to SHIFT
      </Link>
    </div>
  );
}
