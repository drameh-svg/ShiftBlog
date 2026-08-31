import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-4xl">Editorial access only</h1>
      <p className="mt-4 text-muted">
        SHIFT Editorial is limited to approved Public Policy team members. A public account is not enough.
      </p>
      <Link href="/sign-in" className="mt-8 inline-flex rounded-full bg-fg px-5 py-3 text-sm text-bg">
        Sign in
      </Link>
    </div>
  );
}
