import Link from "next/link";
import type { StoryCategory } from "@prisma/client";
import { FeatureCard, HorizontalCard, CompactCard, BriefCard } from "@/components/stories/story-cards";
import { getPublishedStories } from "@/lib/queries";
import { TAGS, CATEGORY_LABELS } from "@/lib/content";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as StoryCategory[];

import type { Search } from "@/lib/page-props";

export default async function StoriesPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const category = CATEGORIES.includes(params.category as StoryCategory)
    ? (params.category as StoryCategory)
    : undefined;
  const stories = await getPublishedStories({ tag, category, take: 30 });
  const [lead, ...rest] = stories;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Stories</p>
      <h1 className="display mt-2 max-w-3xl text-5xl sm:text-6xl">What SHIFT is talking about.</h1>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Topics">
        <FilterChip href="/stories" active={!tag && !category} label="All" />
        {CATEGORIES.map((value) => (
          <FilterChip
            key={value}
            href={`/stories?category=${value}`}
            active={category === value}
            label={CATEGORY_LABELS[value]}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {TAGS.map((value) => (
          <Link
            key={value}
            href={`/stories?tag=${value.toLowerCase().replace(/\s+/g, "-")}`}
            className={`rounded-full px-3 py-1 text-xs ${tag === value.toLowerCase().replace(/\s+/g, "-") ? "bg-purple text-white" : "border border-line text-muted"}`}
          >
            {value}
          </Link>
        ))}
      </div>

      {lead && (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <FeatureCard story={lead} />
          <div>
            {rest.slice(0, 4).map((story) => (
              <CompactCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-4">
        {rest.slice(4, 8).map((story) => (
          <HorizontalCard key={story.id} story={story} />
        ))}
      </div>
      <div className="mt-8 flex gap-4 overflow-x-auto">
        {rest.filter((story) => story.isBrief).map((story) => (
          <BriefCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${active ? "bg-fg text-bg" : "border border-line text-muted"}`}
    >
      {label}
    </Link>
  );
}
