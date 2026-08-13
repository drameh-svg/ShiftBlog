"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";
import { SearchButton, SearchPalette } from "@/components/search/search-palette";
import type { SessionUser } from "@/lib/session-types";
import { isEditorial } from "@/lib/permissions";

const NAV = [
  { href: "/stories", label: "Stories" },
  { href: "/discuss", label: "Discuss" },
  { href: "/involve", label: "Get Involved" },
  { href: "/submit", label: "Submit" },
];

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [openSearch, setOpenSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors ${scrolled ? "glass border-line" : "border-transparent bg-transparent"}`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Wordmark stacked={false} />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${active ? "bg-purple/15 text-purple" : "text-muted hover:text-fg"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <SearchButton onOpen={() => setOpenSearch(true)} />
            <ThemeToggle />
            {user ? (
              <Link
                href={isEditorial(user.role) ? "/editor" : "/profile"}
                className="inline-flex h-10 items-center rounded-full border border-line px-3 text-sm"
              >
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link href="/sign-in" className="inline-flex h-10 items-center rounded-full bg-fg px-3.5 text-sm text-bg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      <SearchPalette open={openSearch} onClose={() => setOpenSearch(false)} />
    </>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/stories", label: "Stories", icon: StoriesIcon },
    { href: "/discuss", label: "Discuss", icon: DiscussIcon },
    { href: "/involve", label: "Involve", icon: InvolveIcon },
  ];
  return (
    <nav
      className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-2 md:hidden"
      aria-label="Mobile"
    >
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${active ? "text-lime" : "text-muted"}`}
          >
            <Icon active={active} />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/submit"
        className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-purple"
      >
        <SubmitIcon />
        Submit
      </Link>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
    </svg>
  );
}
function StoriesIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
      <path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function DiscussIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 7.5A3.5 3.5 0 0 1 8.5 4h7A3.5 3.5 0 0 1 19 7.5v5A3.5 3.5 0 0 1 15.5 16H10l-5 3v-3.2A3.5 3.5 0 0 1 5 12.5v-5Z" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
    </svg>
  );
}
function InvolveIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SubmitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
