"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { OpportunityStatus, OpportunityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEditorial } from "@/lib/auth";
import { slugify } from "@/lib/content";

const schema = z.object({
  title: z.string().min(4),
  type: z.enum(["PANEL", "LEADERSHIP", "PETITION", "MEETING", "PUBLIC_COMMENT", "RESEARCH", "INITIATIVE"]),
  description: z.string().min(8),
  body: z.string().min(12),
  dateLabel: z.string().optional(),
  location: z.string().optional(),
  organizer: z.string().min(2),
  eligibility: z.string().optional(),
  status: z.enum(["OPEN", "UPCOMING", "CLOSING_SOON", "ONGOING", "COMPLETED"]),
  ctaLabel: z.string().min(2),
  ctaHref: z.string().optional(),
  urgent: z.boolean().optional(),
});

export async function saveOpportunity(id: string | null, formData: FormData) {
  await requireEditorial();
  const parsed = schema.parse({
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? "PANEL"),
    description: String(formData.get("description") ?? ""),
    body: String(formData.get("body") ?? ""),
    dateLabel: String(formData.get("dateLabel") ?? ""),
    location: String(formData.get("location") ?? ""),
    organizer: String(formData.get("organizer") ?? ""),
    eligibility: String(formData.get("eligibility") ?? ""),
    status: String(formData.get("status") ?? "OPEN"),
    ctaLabel: String(formData.get("ctaLabel") ?? "Learn More"),
    ctaHref: String(formData.get("ctaHref") ?? ""),
    urgent: formData.get("urgent") === "on",
  });
  const slug = slugify(parsed.title);
  const data = {
    ...parsed,
    type: parsed.type as OpportunityType,
    status: parsed.status as OpportunityStatus,
    dateLabel: parsed.dateLabel || null,
    location: parsed.location || null,
    eligibility: parsed.eligibility || null,
    ctaHref: parsed.ctaHref || null,
    urgent: parsed.urgent ?? false,
    slug,
  };
  if (id) {
    await prisma.opportunity.update({ where: { id }, data });
  } else {
    await prisma.opportunity.create({ data });
  }
  revalidatePath("/involve");
  revalidatePath("/");
  revalidatePath("/editor/involve");
  redirect("/editor/involve");
}
