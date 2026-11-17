import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canDeleteContent } from "@/lib/permissions";
import { StoryEditor } from "@/components/editor/story-editor";
import type { IdParams } from "@/lib/page-props";

export default async function EditStoryPage({ params }: { params: IdParams }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const story = await prisma.story.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!story) notFound();
  return <StoryEditor story={story} canDelete={canDeleteContent(user?.role)} />;
}
