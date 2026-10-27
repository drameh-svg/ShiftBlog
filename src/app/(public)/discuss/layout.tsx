import { DiscussShell } from "@/components/discuss/discuss-shell";
import { prisma } from "@/lib/prisma";

export default async function DiscussLayout({ children }: { children: React.ReactNode }) {
  const channels = await prisma.discussion.findMany({
    select: {
      slug: true,
      title: true,
      topic: true,
      isDebate: true,
      locked: true,
      updatedAt: true,
      _count: { select: { posts: true, arguments: true, votes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <DiscussShell channels={channels}>{children}</DiscussShell>;
}
