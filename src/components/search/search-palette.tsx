"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Result = {
  stories: { slug: string; title: string; category: string }[];
  discussions: { slug: string; title: string }[];
  authors: { name: string; title: string | null }[];
};

export function SearchButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-bg-elevated/40 px-3 text-sm text-muted transition hover:border-purple/40 hover:text-fg"
      aria-label="Search SHIFT"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] text-faint lg:inline">⌘K</kbd>
    </button>
  );
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result>({ stories: [], discussions: [], authors: [] });
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      if (response.ok) setResults(await response.json());
    }, 120);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const items = useMemo(() => {
    if (query.trim().length < 2) return [];
    return [
      ...results.stories.map((story) => ({
        href: `/stories/${story.slug}`,
        label: story.title,
        kind: "Story",
      })),
      ...results.discussions.map((discussion) => ({
        href: `/discuss/${discussion.slug}`,
        label: discussion.title,
        kind: "Discussion",
      })),
      ...results.authors.map((author) => ({
        href: `/search?q=${encodeURIComponent(author.name)}`,
        label: author.name,
        kind: "Author",
      })),
    ];
  }, [results, query]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close search" onClick={onClose} />
      <div className="glass relative w-full max-w-xl overflow-hidden rounded-[1.6rem] shadow-glow">
        <form
          action="/search"
          onSubmit={(event) => {
            if (items[active]) {
              event.preventDefault();
              go(items[active].href);
            }
          }}
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-muted">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((value) => Math.min(items.length - 1, value + 1));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((value) => Math.max(0, value - 1));
                }
              }}
              placeholder="Search stories, discussions, authors"
              className="h-14 w-full bg-transparent text-base outline-none placeholder:text-faint"
              autoComplete="off"
            />
          </div>
        </form>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim().length < 2 && (
            <p className="px-3 py-6 text-sm text-muted">Try “facial recognition”, “classroom AI”, or an author name.</p>
          )}
          {items.map((item, index) => (
            <button
              key={item.href + item.label}
              type="button"
              onClick={() => go(item.href)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left ${index === active ? "bg-purple/15" : ""}`}
            >
              <span>{item.label}</span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-faint">{item.kind}</span>
            </button>
          ))}
          {query.trim().length >= 2 && (
            <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={onClose} className="block px-3 py-3 text-sm text-purple">
              See all results →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
