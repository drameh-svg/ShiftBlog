import Link from "next/link";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line pb-28 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark stacked />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Technology is changing the institutions around us. Students deserve a voice in deciding how.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Read</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/read" className="hover:text-purple">Read</Link></li>
            <li><Link href="/discuss" className="hover:text-purple">Discuss</Link></li>
            <li><Link href="/involve" className="hover:text-purple">Get Involved</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Contribute</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/submit/idea" className="hover:text-purple">Submit an Idea</Link></li>
            <li><Link href="/submit/writing" className="hover:text-purple">Write for SHIFT</Link></li>
            <li><Link href="/sign-in" className="hover:text-purple">Sign In</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-faint sm:px-6">
        © {new Date().getFullYear()} SHIFT Public Policy · A USC student-led publication
      </p>
    </footer>
  );
}
