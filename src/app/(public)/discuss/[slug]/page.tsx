import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DebateBoard, DiscussionThread } from "@/components/discuss/discussion-live";
import { safeTags } from "@/components/discuss/discussion-card";
import type { SlugParams } from "@/lib/page-props";

export default async function DiscussionPage({ params }: { params: SlugParams }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const discussion = await prisma.discussion.findUnique({
    where: { slug },
    include: {
      creator: { select: { name: true } },
      posts: {
        where: { hidden: false },
        include: { user: { select: { name: true, avatarHue: true } } },
        orderBy: { createdAt: "asc" },
      },
      arguments: {
        where: { hidden: false, parentId: null },
        include: { user: { select: { name: true } }, reactions: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!discussion) notFound();
  const tags = safeTags(discussion.tags);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-purple">
        {discussion.isDebate ? "Debate" : discussion.topic.toLowerCase()}
      </p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">{discussion.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{discussion.prompt}</p>
      <p className="mt-3 text-sm text-faint">Started by {discussion.creator.name}</p>
      {tags.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
              {tag}
            </span>
          ))}
        </p>
      )}
      <div className="mt-10">
        {discussion.isDebate ? (
          <DebateBoard
            discussionId={discussion.id}
            locked={discussion.locked}
            userId={user?.id}
            argumentsFor={discussion.arguments.filter((item) => item.side === "FOR")}
            argumentsAgainst={discussion.arguments.filter((item) => item.side === "AGAINST")}
          />
        ) : (
          <DiscussionThread
            discussionId={discussion.id}
            locked={discussion.locked}
            userId={user?.id}
            posts={discussion.posts}
          />
        )}
      </div>
    </div>
  );
}
