"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireEditorial } from "@/lib/auth";
import { NOTE_COLORS } from "@/lib/content";

export async function addComment(input: { storyId: string; body: string; color: string }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to comment." };
  const body = input.body.trim();
  if (body.length < 3) return { error: "Say a little more — at least a sentence." };
  if (body.length > 600) return { error: "Keep notes under 600 characters." };
  const color = NOTE_COLORS.includes(input.color as (typeof NOTE_COLORS)[number]) ? input.color : "cream";
  const story = await prisma.story.findUnique({ where: { id: input.storyId } });
  if (!story || story.status !== "PUBLISHED") return { error: "Story not found." };
  await prisma.comment.create({
    data: {
      storyId: story.id,
      userId: user.id,
      body,
      color,
      posX: 8 + Math.random() * 62,
      posY: 6 + Math.random() * 48,
      rotation: Math.random() * 6 - 3,
    },
  });
  revalidatePath(`/stories/${story.slug}`);
  return { ok: true };
}

export async function addCommentReply(commentId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to reply." };
  const text = body.trim();
  if (text.length < 2) return { error: "Reply is too short." };
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { story: true } });
  if (!comment || comment.hidden) return { error: "Comment not found." };
  await prisma.commentReply.create({ data: { commentId, userId: user.id, body: text } });
  revalidatePath(`/stories/${comment.story.slug}`);
  return { ok: true };
}

export async function reactToComment(commentId: string, type: "agree" | "disagree") {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to react." };
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { story: true } });
  if (!comment) return { error: "Comment not found." };
  const existing = await prisma.reaction.findFirst({
    where: { userId: user.id, commentId, type },
  });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { userId: user.id, commentId, type } });
  }
  revalidatePath(`/stories/${comment.story.slug}`);
  return { ok: true };
}

export async function reportComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to report." };
  await prisma.report.create({
    data: { reporterId: user.id, commentId, reason: "inappropriate" },
  });
  return { ok: true };
}

export async function addDiscussionPost(discussionId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to join the discussion." };
  const text = body.trim();
  if (text.length < 8) return { error: "Add a complete thought." };
  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion || discussion.locked) return { error: "This discussion is closed." };
  await prisma.discussionPost.create({ data: { discussionId, userId: user.id, body: text } });
  await prisma.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
  revalidatePath(`/discuss/${discussion.slug}`);
  return { ok: true };
}

export async function addDebateArgument(discussionId: string, side: "FOR" | "AGAINST", body: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to add an argument." };
  const text = body.trim();
  if (text.length < 12) return { error: "Arguments should be a complete claim." };
  if (side !== "FOR" && side !== "AGAINST") return { error: "Choose a side." };
  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion || !discussion.isDebate || discussion.locked) return { error: "Debate not found." };
  await prisma.debateArgument.create({ data: { discussionId, userId: user.id, side, body: text } });
  await prisma.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
  revalidatePath(`/discuss/${discussion.slug}`);
  return { ok: true };
}

export async function reactToArgument(argumentId: string, type: "support" | "challenge") {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to react." };
  const argument = await prisma.debateArgument.findUnique({
    where: { id: argumentId },
    include: { discussion: true },
  });
  if (!argument) return { error: "Argument not found." };
  const existing = await prisma.reaction.findFirst({ where: { userId: user.id, argumentId, type } });
  if (existing) await prisma.reaction.delete({ where: { id: existing.id } });
  else await prisma.reaction.create({ data: { userId: user.id, argumentId, type } });
  revalidatePath(`/discuss/${argument.discussion.slug}`);
  return { ok: true };
}

export async function hideComment(commentId: string) {
  await requireEditorial();
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { hidden: true },
    include: { story: true },
  });
  revalidatePath(`/stories/${comment.story.slug}`);
  revalidatePath("/editor/discussions");
}

export async function lockDiscussion(discussionId: string, locked: boolean) {
  await requireEditorial();
  const discussion = await prisma.discussion.update({
    where: { id: discussionId },
    data: { locked },
  });
  revalidatePath(`/discuss/${discussion.slug}`);
  revalidatePath("/editor/discussions");
}

export async function reviewReport(reportId: string, status: "REVIEWED" | "DISMISSED") {
  await requireEditorial();
  z.enum(["REVIEWED", "DISMISSED"]).parse(status);
  await prisma.report.update({ where: { id: reportId }, data: { status } });
  revalidatePath("/editor/discussions");
}
