"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireEditorial } from "@/lib/auth";
import type { SubmissionStatus } from "@prisma/client";

export async function submitIdeaAction(_: unknown, formData: FormData) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    topic: z.string().min(2),
    category: z.string().min(2),
    idea: z.string().min(20),
    why: z.string().min(12),
    links: z.string().optional(),
    anonymous: z.boolean(),
  });
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    category: String(formData.get("category") ?? ""),
    idea: String(formData.get("idea") ?? ""),
    why: String(formData.get("why") ?? ""),
    links: String(formData.get("links") ?? ""),
    anonymous: formData.get("anonymous") === "on",
  });
  if (!parsed.success) {
    return { error: "Please complete the required fields with enough detail for editors to evaluate." };
  }
  const user = await getCurrentUser();
  await prisma.ideaSubmission.create({
    data: {
      name: parsed.data.anonymous ? "Anonymous student" : parsed.data.name,
      email: parsed.data.anonymous ? null : parsed.data.email || null,
      anonymous: parsed.data.anonymous,
      topic: parsed.data.topic,
      category: parsed.data.category,
      idea: parsed.data.idea,
      why: parsed.data.why,
      links: parsed.data.links || null,
      userId: user?.id,
    },
  });
  revalidatePath("/editor/ideas");
  return { ok: true };
}

export async function submitWritingAction(_: unknown, formData: FormData) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    title: z.string().min(4),
    articleType: z.string().min(2),
    topic: z.string().min(2),
    pitch: z.string().min(20),
    draft: z.string().min(40),
    sources: z.string().optional(),
    bio: z.string().min(12),
    bylinePreference: z.string(),
  });
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    title: String(formData.get("title") ?? ""),
    articleType: String(formData.get("articleType") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    pitch: String(formData.get("pitch") ?? ""),
    draft: String(formData.get("draft") ?? ""),
    sources: String(formData.get("sources") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    bylinePreference: String(formData.get("bylinePreference") ?? "named"),
  });
  if (!parsed.success) {
    return { error: "Please complete the writing submission, including a pitch and draft." };
  }
  const user = await getCurrentUser();
  await prisma.articleSubmission.create({
    data: { ...parsed.data, userId: user?.id },
  });
  revalidatePath("/editor/submissions");
  return { ok: true };
}

export async function updateIdeaStatus(id: string, status: SubmissionStatus, notes?: string) {
  await requireEditorial();
  await prisma.ideaSubmission.update({ where: { id }, data: { status, notes } });
  revalidatePath("/editor/ideas");
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, notes?: string) {
  await requireEditorial();
  await prisma.articleSubmission.update({ where: { id }, data: { status, notes } });
  revalidatePath("/editor/submissions");
}
