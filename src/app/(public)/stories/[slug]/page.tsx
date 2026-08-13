import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleBody } from "@/components/stories/article-body";
import { ArticleRail } from "@/components/stories/article-rail";
import { CategoryChip, FeatureCard, StoryMeta } from "@/components/stories/story-cards";
import { EditorialVisual } from "@/components/stories/editorial-visual";
import { ReadingProgress } from "@/components/stories/reading-progress";
import { StickyDiscussion } from "@/components/stories/sticky-discussion";
import { getCurrentUser } from "@/lib/auth";
import { isEditorial } from "@/lib/permissions";
import { getRelatedStories, getStoryBySlug, isPublicStory } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type { Search, SlugParams } from "@/lib/page-props";

export async function generateMetadata({
  params,
}: {
  params: SlugParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await prisma.story.findUnique({ where: { slug } });
  if (!story) return { title: "Story" };
  return {
    title: story.title,
    description: story.seoDescription || story.dek,
  };
}

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: Search;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();
  const preview = query.preview === "1" && user && isEditorial(user.role);
  const story = await getStoryBySlug(slug);
  if (!story) notFound();
  if (!preview && !isPublicStory(story)) notFound();

  const related = await getRelatedStories(story.id, story.category);
  const saved = user
    ? Boolean(await prisma.savedStory.findUnique({ where: { userId_storyId: { userId: user.id, storyId: story.id } } }))
    : false;
  const comments = story.comments;

  return (
    <article className="relative pb-10">
      <ReadingProgress />
      <ArticleRail title={story.title} slug={story.slug} storyId={story.id} saved={saved} signedIn={Boolean(user)} />
      <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <CategoryChip category={story.category} />
        <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.6rem)]">{story.title}</h1>
        {story.subtitle && <p className="mt-4 text-xl text-muted">{story.subtitle}</p>}
        <p className="mt-4 text-lg leading-8 text-muted">{story.dek}</p>
        <StoryMeta story={story} />
      </header>
      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
        <EditorialVisual theme={story.visualTheme} className="h-[280px] rounded-[2rem] sm:h-[420px]" />
      </div>
      <div className="mx-auto mt-12 max-w-2xl px-4 sm:px-6">
        <ArticleBody raw={story.body} />
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <StickyDiscussion storyId={story.id} notes={comments} userId={user?.id} />
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="display text-3xl">Related stories</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <FeatureCard key={item.id} story={item} />
              ))}
            </div>
            <p className="mt-8 text-sm">
              <Link href="/discuss" className="text-purple">
                Join the Discussion →
              </Link>
            </p>
          </section>
        )}
      </div>
    </article>
  );
}
