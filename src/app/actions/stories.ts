"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { StoryCategory, StoryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireEditorial } from "@/lib/auth";
import { canDeleteContent } from "@/lib/permissions";
import { estimateReadingMinutes, parseBody, serializeBody, slugify, type Block } from "@/lib/content";

const storySchema = z.object({
  title: z.string().min(4).max(160),
  subtitle: z.string().max(200).optional(),
  dek: z.string().min(8).max(400),
  category: z.enum(["NEWS", "OPINION", "ANALYSIS", "EXPLAINER", "CAMPUS", "INTERVIEW", "RESEARCH", "ESSAY"]),
  visualTheme: z.string().min(2),
  seoDescription: z.string().max(220).optional(),
  tags: z.array(z.string()).optional(),
  body: z.string().min(2),
  isBrief: z.boolean().optional(),
  leadStory: z.boolean().optional(),
  featured: z.boolean().optional(),
});

function excerptFrom(dek: string, blocks: Block[]) {
  const first = blocks.find((block) => block.type === "p");
  return dek || (first && "text" in first ? first.text.slice(0, 220) : "");
}

export async function createStoryAction() {
  const user = await requireEditorial();
  const story = await prisma.story.create({
    data: {
      title: "Untitled story",
      slug: `draft-${Date.now()}`,
      dek: "",
      excerpt: "",
      body: serializeBody([{ type: "p", text: "" }]),
      category: "CAMPUS",
      status: "DRAFT",
      authorId: user.id,
    },
  });
  redirect(`/editor/stories/${story.id}`);
}

export async function saveStoryDraft(id: string, input: z.infer<typeof storySchema>) {
  const user = await requireEditorial();
  const data = storySchema.parse(input);
  const existing = await prisma.story.findUnique({ where: { id } });
  if (!existing) throw new Error("Story not found");
  const blocks = parseBody(data.body);
  const slugBase = slugify(data.title) || existing.slug;
  let slug = existing.status === "PUBLISHED" ? existing.slug : slugBase;
  if (existing.status !== "PUBLISHED") {
    const clash = await prisma.story.findFirst({ where: { slug, id: { not: id } } });
    if (clash) slug = `${slugBase}-${id.slice(-4)}`;
  }
  const tagRecords = await Promise.all(
    (data.tags ?? []).map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  await prisma.story.update({
    where: { id },
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      dek: data.dek,
      excerpt: excerptFrom(data.dek, blocks),
      body: serializeBody(blocks),
      category: data.category as StoryCategory,
      visualTheme: data.visualTheme,
      seoDescription: data.seoDescription || data.dek,
      isBrief: data.isBrief ?? false,
      leadStory: user.role === "ADMIN" ? (data.leadStory ?? existing.leadStory) : existing.leadStory,
      featured: data.featured ?? existing.featured,
      readingMinutes: estimateReadingMinutes(blocks),
      slug,
      tags: {
        deleteMany: {},
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
  });
  revalidatePath("/editor");
  revalidatePath("/editor/stories");
  return { ok: true, slug };
}

export async function setStoryStatus(id: string, status: StoryStatus, scheduledAt?: string) {
  const user = await requireEditorial();
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw new Error("Story not found");
  if (status === "ARCHIVED" && !canDeleteContent(user.role)) {
    throw new Error("Unauthorized");
  }
  const data: {
    status: StoryStatus;
    publishedAt?: Date | null;
    scheduledAt?: Date | null;
  } = { status };
  if (status === "PUBLISHED") {
    data.publishedAt = new Date();
    data.scheduledAt = null;
  }
  if (status === "SCHEDULED") {
    const when = scheduledAt ? new Date(scheduledAt) : null;
    if (!when || Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      throw new Error("Choose a future date to schedule.");
    }
    data.scheduledAt = when;
    data.publishedAt = when;
  }
  if (status === "DRAFT" || status === "IN_REVIEW") {
    data.publishedAt = null;
    data.scheduledAt = null;
  }
  const updated = await prisma.story.update({ where: { id }, data });
  revalidatePath("/editor");
  revalidatePath("/stories");
  revalidatePath(`/stories/${updated.slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteStory(id: string) {
  await requireAdmin();
  await prisma.story.delete({ where: { id } });
  revalidatePath("/editor/stories");
  revalidatePath("/stories");
  redirect("/editor/stories");
}
