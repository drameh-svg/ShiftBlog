import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isEditorial } from "@/lib/permissions";
import { signOutAction } from "@/app/actions/auth";
import { createStoryAction } from "@/app/actions/stories";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/editor", label: "Overview" },
  { href: "/editor/stories", label: "Stories" },
  { href: "/editor/submissions", label: "Submissions" },
  { href: "/editor/ideas", label: "Ideas" },
  { href: "/editor/discussions", label: "Discussions" },
  { href: "/editor/involve", label: "Get Involved" },
  { href: "/editor/team", label: "Team" },
];

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !isEditorial(user.role)) {
    redirect("/sign-in?next=/editor");
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-lime">Private</p>
            <Link href="/editor" className="text-lg font-semibold tracking-[-0.04em]">
              SHIFT Editorial
            </Link>
          </div>
          <form action={createStoryAction}>
            <button className="rounded-full bg-lime px-4 py-2 text-sm font-medium text-[#142006]">+ New Story</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3" aria-label="Editorial">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-1 text-sm text-muted hover:text-fg">
              {item.label}
            </Link>
          ))}
          <Link href="/" className="ml-auto rounded-full px-3 py-1 text-sm text-purple">
            View site
          </Link>
          <form action={signOutAction}>
            <button className="px-3 py-1 text-sm text-muted">Sign out</button>
          </form>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
