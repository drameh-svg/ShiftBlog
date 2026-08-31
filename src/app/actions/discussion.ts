"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireEditorial } from "@/lib/auth";
import { DISCUSSION_TOPIC_ORDER, isStance, NOTE_COLORS, slugify, type Stance } from "@/lib/content";
import type { DiscussionTopic } from "@prisma/client";

function clampNotePos(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export async function addComment(input: {
  storyId: string;
  body: string;
  color: string;
  posX?: number;
  posY?: number;
}) {
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
      posX: clampNotePos(input.posX, 2, 72, 6 + Math.random() * 58),
      posY: clampNotePos(input.posY, 2, 68, 6 + Math.random() * 52),
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

export async function castDiscussionVote(discussionId: string, choice: Stance) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to take a stance." };
  if (!isStance(choice)) return { error: "Choose For, Against, or Still thinking." };
  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion || discussion.locked) return { error: "This discussion is closed." };
  await prisma.discussionVote.upsert({
    where: { discussionId_userId: { discussionId, userId: user.id } },
    update: { choice },
    create: { discussionId, userId: user.id, choice },
  });
  await prisma.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
  revalidatePath("/discuss");
  revalidatePath(`/discuss/${discussion.slug}`);
  return { ok: true };
}

export async function addDiscussionPost(discussionId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to join the discussion." };
  const text = body.trim();
  if (text.length < 2) return { error: "Add a complete thought." };
  if (text.length > 2000) return { error: "Keep messages under 2,000 characters." };
  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion || discussion.locked) return { error: "This discussion is closed." };
  const vote = await prisma.discussionVote.findUnique({
    where: { discussionId_userId: { discussionId, userId: user.id } },
  });
  if (!vote) return { error: "Pick a stance on this topic before you send a message." };
  await prisma.discussionPost.create({
    data: { discussionId, userId: user.id, body: text, stance: vote.choice },
  });
  await prisma.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
  revalidatePath("/discuss");
  revalidatePath(`/discuss/${discussion.slug}`);
  return { ok: true };
}

export async function startDiscussion(input: { title: string; prompt: string; topic: string }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to start a topic." };
  const title = input.title.trim();
  const prompt = input.prompt.trim();
  if (title.length < 8) return { error: "Give the topic a fuller title." };
  if (prompt.length < 12) return { error: "Add a prompt so people know what they are answering." };
  const topic = DISCUSSION_TOPIC_ORDER.includes(input.topic as (typeof DISCUSSION_TOPIC_ORDER)[number])
    ? (input.topic as DiscussionTopic)
    : "GENERAL";
  let slug = slugify(title);
  const clash = await prisma.discussion.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const discussion = await prisma.discussion.create({
    data: { slug, title, prompt, topic, creatorId: user.id, isDebate: topic === "DEBATES" },
  });
  revalidatePath("/discuss");
  revalidatePath(`/discuss/${discussion.slug}`);
  return { ok: true, slug: discussion.slug };
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
  revalidatePath("/discuss");
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
  revalidatePath("/discuss");
  revalidatePath(`/discuss/${discussion.slug}`);
  revalidatePath("/editor/discussions");
}

export async function reviewReport(reportId: string, status: "REVIEWED" | "DISMISSED") {
  await requireEditorial();
  z.enum(["REVIEWED", "DISMISSED"]).parse(status);
  await prisma.report.update({ where: { id: reportId }, data: { status } });
  revalidatePath("/editor/discussions");
}
