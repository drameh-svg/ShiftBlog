import Link from "next/link";
import { FeatureCard, HorizontalCard, CompactCard, BriefCard } from "@/components/stories/story-cards";
import { getPublishedStories } from "@/lib/queries";
import { READ_FILTERS } from "@/lib/content";
import type { Search } from "@/lib/page-props";

export default async function ReadPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const requested = String(params.category ?? "");
  const match = READ_FILTERS.find((item) => item.category === requested);
  const category = match?.category;
  const stories = await getPublishedStories({ category, take: 30 });
  const [lead, ...rest] = stories;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Read</p>
      <h1 className="display mt-2 max-w-3xl text-5xl sm:text-6xl">Read</h1>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Topics">
        {READ_FILTERS.map((item) => (
          <FilterChip
            key={item.category}
            href={`/read?category=${item.category}`}
            active={category === item.category}
            label={item.label}
          />
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
