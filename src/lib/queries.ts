import { prisma } from "./prisma";
import type { StoryCategory, StoryStatus } from "@prisma/client";

const storyInclude = {
  author: { select: { id: true, name: true, title: true, avatarHue: true } },
  tags: { include: { tag: true } },
  _count: { select: { comments: true } },
} as const;

export async function getPublishedStories(options?: {
  category?: StoryCategory;
  tag?: string;
  take?: number;
  skip?: number;
}) {
  await publishDueStories();
  return prisma.story.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(options?.category ? { category: options.category } : {}),
      ...(options?.tag
        ? { tags: { some: { tag: { slug: options.tag } } } }
        : {}),
    },
    include: storyInclude,
    orderBy: { publishedAt: "desc" },
    take: options?.take ?? 24,
    skip: options?.skip,
  });
}

export async function getLeadStory() {
  await publishDueStories();
  return prisma.story.findFirst({
    where: {
      status: "PUBLISHED",
      leadStory: true,
      publishedAt: { lte: new Date() },
    },
    include: storyInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getStoryBySlug(slug: string) {
  return prisma.story.findUnique({
    where: { slug },
    include: {
      ...storyInclude,
      comments: {
            where: { hidden: false },
            include: {
              user: { select: { id: true, name: true, avatarHue: true } },
              replies: {
                where: { hidden: false },
                include: { user: { select: { id: true, name: true, avatarHue: true } } },
                orderBy: { createdAt: "asc" },
              },
              reactions: true,
            },
            orderBy: { createdAt: "desc" },
          },
    },
  });
}

export async function getRelatedStories(storyId: string, category: StoryCategory, take = 3) {
  return prisma.story.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      id: { not: storyId },
      category,
    },
    include: storyInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function searchContent(query: string) {
  const q = query.trim();
  if (q.length < 2) {
    return { stories: [], discussions: [], authors: [] };
  }
  const [stories, discussions, authors] = await Promise.all([
    prisma.story.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q } },
          { dek: { contains: q } },
          { excerpt: { contains: q } },
        ],
      },
      include: storyInclude,
      take: 8,
    }),
    prisma.discussion.findMany({
      where: {
        OR: [{ title: { contains: q } }, { prompt: { contains: q } }],
      },
      include: {
        creator: { select: { name: true } },
        _count: { select: { posts: true, arguments: true } },
      },
      take: 6,
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["EDITOR", "ADMIN"] },
        name: { contains: q },
      },
      select: { id: true, name: true, title: true, avatarHue: true },
      take: 5,
    }),
  ]);
  return { stories, discussions, authors };
}

export function isPublicStory(story: { status: StoryStatus; publishedAt: Date | null }) {
  return (
    (story.status === "PUBLISHED" || story.status === "SCHEDULED") &&
    !!story.publishedAt &&
    story.publishedAt <= new Date()
  );
}

async function publishDueStories() {
  await prisma.story.updateMany({
    where: { status: "SCHEDULED", publishedAt: { lte: new Date() } },
    data: { status: "PUBLISHED" },
  });
}
