"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DISCUSSION_TOPIC_LABELS, DISCUSSION_TOPIC_ORDER } from "@/lib/content";
import { formatRelative } from "@/lib/format";

export type ChannelSummary = {
  slug: string;
  title: string;
  topic: string;
  isDebate: boolean;
  locked: boolean;
  updatedAt: Date | string;
  _count: { posts: number; arguments: number; votes: number };
};

export function DiscussShell({
  channels,
  children,
}: {
  channels: ChannelSummary[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const grouped = useMemo(() => {
    return DISCUSSION_TOPIC_ORDER.map((id) => ({
      id,
      label: DISCUSSION_TOPIC_LABELS[id] ?? id,
      items: channels.filter((channel) => channel.topic === id),
    })).filter((group) => group.items.length > 0);
  }, [channels]);

  const active = channels.find((channel) => pathname === `/discuss/${channel.slug}`);

  const sidebar = (
    <aside className="discuss-sidebar flex h-full w-full flex-col border-r border-line md:w-[17.5rem] md:shrink-0">
      <div className="border-b border-line px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Discuss</p>
        <h2 className="display mt-1 text-2xl">Topics</h2>
        <p className="mt-1 text-xs leading-5 text-muted">Pick a channel. Take a stance. Then talk.</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Discussion topics">
        {grouped.map((group) => (
          <div key={group.id} className="mb-4">
            <p className="px-2 pb-1 text-[10px] uppercase tracking-[0.16em] text-faint">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((channel) => {
                const href = `/discuss/${channel.slug}`;
                const isActive = pathname === href;
                const messages = channel._count.posts + channel._count.arguments;
                return (
                  <li key={channel.slug}>
                    <Link
                      href={href}
                      className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm leading-5 ${
                        isActive ? "bg-purple/18 text-fg" : "text-muted hover:bg-fg/5 hover:text-fg"
                      }`}
                    >
                      <span className="mt-0.5 text-faint">#</span>
                      <span className="min-w-0">
                        <span className="block truncate">{channel.title}</span>
                        <span className="block text-[11px] text-faint">
                          {messages} messages · {formatRelative(channel.updatedAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <p className="text-xs leading-5 text-muted">Post anonymously. No account needed.</p>
      </div>
    </aside>
  );

  return (
    <div className="fixed inset-x-0 top-16 bottom-[4.75rem] z-20 flex bg-bg md:bottom-0">
      <div className="hidden h-full md:flex">{sidebar}</div>
      {open && (
        <div className="absolute inset-0 z-30 flex md:hidden">
          <button
            type="button"
            aria-label="Close topics"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full w-[min(20rem,88vw)] shadow-2xl">{sidebar}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-3 py-2 md:hidden">
          <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-line px-3 py-1.5 text-sm">
            Topics
          </button>
          <p className="truncate text-sm">{active?.title ?? "Discuss"}</p>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
