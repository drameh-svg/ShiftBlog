import { prisma } from "@/lib/prisma";
import { DiscussionCard } from "@/components/discuss/discussion-card";
import type { DiscussionTopic } from "@prisma/client";

const TOPICS: { id: string; label: string; value?: DiscussionTopic | "DEBATE" }[] = [
  { id: "trending", label: "Trending" },
  { id: "latest", label: "Latest" },
  { id: "campus", label: "Campus", value: "CAMPUS" },
  { id: "ai", label: "AI", value: "AI" },
  { id: "policy", label: "Policy", value: "POLICY" },
  { id: "debates", label: "Debates", value: "DEBATE" },
];

import type { Search } from "@/lib/page-props";

export default async function DiscussPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const topic = typeof params.topic === "string" ? params.topic : "trending";
  const where =
    topic === "debates"
      ? { isDebate: true }
      : topic === "campus"
        ? { topic: "CAMPUS" as const }
        : topic === "ai"
          ? { topic: "AI" as const }
          : topic === "policy"
            ? { topic: "POLICY" as const }
            : {};
  const discussions = await prisma.discussion.findMany({
    where,
    include: {
      creator: { select: { name: true } },
      _count: { select: { posts: true, arguments: true } },
    },
    orderBy: topic === "latest" ? { createdAt: "desc" } : { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Discuss</p>
      <h1 className="display mt-2 max-w-3xl text-5xl">Think in public.</h1>
      <p className="mt-4 max-w-xl text-muted">
        SHIFT’s forum is for campus arguments that deserve more than a comment thread. Stay specific. Stay civil. Disagree well.
      </p>
      <div className="mt-8 flex gap-2 overflow-x-auto">
        {TOPICS.map((item) => (
          <a
            key={item.id}
            href={`/discuss?topic=${item.id}`}
            className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${topic === item.id ? "bg-fg text-bg" : "border border-line text-muted"}`}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {discussions.map((discussion) => (
          <DiscussionCard key={discussion.id} discussion={discussion} />
        ))}
      </div>
    </div>
  );
}
