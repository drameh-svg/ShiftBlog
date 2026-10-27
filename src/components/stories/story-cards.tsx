import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/content";
import { formatDate, readingLabel } from "@/lib/format";
import { EditorialVisual } from "./editorial-visual";

export type StoryCardData = {
  slug: string;
  title: string;
  dek: string;
  excerpt?: string;
  category: string;
  visualTheme: string;
  readingMinutes: number;
  publishedAt: Date | string | null;
  isBrief?: boolean;
  author: { name: string };
  tags?: { tag: { name: string; slug: string } }[];
  _count?: { comments: number };
};

export function CategoryChip({ category }: { category: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple">
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

export function StoryMeta({
  story,
  comments = true,
}: {
  story: StoryCardData;
  comments?: boolean;
}) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted">
      <span>{story.author.name}</span>
      <span aria-hidden>·</span>
      <time dateTime={story.publishedAt ? new Date(story.publishedAt).toISOString() : undefined}>
        {formatDate(story.publishedAt)}
      </time>
      <span aria-hidden>·</span>
      <span>{readingLabel(story.readingMinutes)}</span>
      {comments && story._count ? (
        <>
          <span aria-hidden>·</span>
          <span>
            {story._count.comments} {story._count.comments === 1 ? "note" : "notes"}
          </span>
        </>
      ) : null}
    </p>
  );
}

export function FeatureCard({ story }: { story: StoryCardData }) {
  return (
    <Link href={`/stories/${story.slug}`} className="card-hover group block overflow-hidden rounded-[1.5rem] border border-line">
      <EditorialVisual theme={story.visualTheme} className="h-52 w-full" />
      <div className="p-5">
        <CategoryChip category={story.category} />
        <h3 className="mt-2 text-2xl leading-[1.15] tracking-[-0.03em] group-hover:text-purple">{story.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{story.dek}</p>
        <StoryMeta story={story} />
      </div>
    </Link>
  );
}

export function CompactCard({ story }: { story: StoryCardData }) {
  return (
    <Link href={`/stories/${story.slug}`} className="group block border-b border-line py-4 last:border-b-0">
      <CategoryChip category={story.category} />
      <h3 className="mt-1 text-lg leading-snug tracking-[-0.03em] group-hover:text-purple">{story.title}</h3>
      <StoryMeta story={story} comments={false} />
    </Link>
  );
}

export function HorizontalCard({ story }: { story: StoryCardData }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="card-hover group grid overflow-hidden rounded-[1.4rem] border border-line md:grid-cols-[200px_1fr]"
    >
      <EditorialVisual theme={story.visualTheme} className="h-40 md:h-full" />
      <div className="p-5">
        <CategoryChip category={story.category} />
        <h3 className="mt-2 text-xl leading-snug tracking-[-0.03em] group-hover:text-purple">{story.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{story.dek}</p>
        <StoryMeta story={story} />
      </div>
    </Link>
  );
}

export function BriefCard({ story }: { story: StoryCardData }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex min-w-[260px] flex-col justify-between rounded-2xl border border-line bg-bg-elevated p-4"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-lime">The Brief</p>
        <h3 className="mt-2 text-base leading-snug tracking-[-0.02em] group-hover:text-purple">{story.title}</h3>
      </div>
      <p className="mt-4 text-xs text-muted">{readingLabel(story.readingMinutes)}</p>
    </Link>
  );
}

export function TextStory({ story }: { story: StoryCardData }) {
  return (
    <Link href={`/stories/${story.slug}`} className="group block rounded-3xl bg-bg-elevated p-6">
      <CategoryChip category={story.category} />
      <h3 className="mt-3 max-w-md text-3xl leading-[1.08] tracking-[-0.04em] group-hover:text-purple">{story.title}</h3>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">{story.dek}</p>
      <p className="mt-5 text-sm text-purple link-arrow">Read the Story →</p>
    </Link>
  );
}
