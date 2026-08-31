import { notFound } from "next/navigation";
import { ChannelChat, type ChatMessage } from "@/components/discuss/channel-chat";
import { getCurrentUser } from "@/lib/auth";
import { DISCUSSION_TOPIC_LABELS, isStance, type Stance } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import type { SlugParams } from "@/lib/page-props";

export default async function DiscussionPage({ params }: { params: SlugParams }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const discussion = await prisma.discussion.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { hidden: false },
        include: { user: { select: { name: true, avatarHue: true } } },
        orderBy: { createdAt: "asc" },
      },
      arguments: {
        where: { hidden: false },
        include: { user: { select: { name: true, avatarHue: true } } },
        orderBy: { createdAt: "asc" },
      },
      votes: true,
    },
  });
  if (!discussion) notFound();

  const messages: ChatMessage[] = [
    ...discussion.posts.map((post) => ({
      id: `post-${post.id}`,
      body: post.body,
      stance: post.stance,
      createdAt: post.createdAt,
      user: post.user,
    })),
    ...discussion.arguments.map((argument) => ({
      id: `arg-${argument.id}`,
      body: argument.body,
      stance: argument.side,
      createdAt: argument.createdAt,
      user: argument.user,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const counts = discussion.votes.reduce(
    (acc, vote) => {
      if (isStance(vote.choice)) acc[vote.choice] += 1;
      return acc;
    },
    { FOR: 0, AGAINST: 0, UNSURE: 0 } as Record<Stance, number>,
  );

  const userVote = user ? discussion.votes.find((vote) => vote.userId === user.id) : undefined;

  return (
    <ChannelChat
      discussionId={discussion.id}
      title={discussion.title}
      prompt={discussion.prompt}
      topicLabel={discussion.isDebate ? "Debate" : (DISCUSSION_TOPIC_LABELS[discussion.topic] ?? discussion.topic)}
      locked={discussion.locked}
      userId={user?.id}
      userStance={userVote && isStance(userVote.choice) ? userVote.choice : null}
      counts={counts}
      messages={messages}
    />
  );
}
