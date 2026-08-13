import Link from "next/link";
import { searchContent } from "@/lib/queries";
import { CompactCard } from "@/components/stories/story-cards";
import { DiscussionCard } from "@/components/discuss/discussion-card";
import type { Search } from "@/lib/page-props";

export default async function SearchPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const results = await searchContent(q);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Search</h1>
      <form className="mt-6">
        <label className="visually-hidden" htmlFor="q">
          Search query
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Stories, topics, discussions, authors"
          className="w-full rounded-full border border-line bg-transparent px-5 py-3"
        />
      </form>
      {q && (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">Stories</h2>
            {results.stories.map((story) => (
              <CompactCard key={story.id} story={story} />
            ))}
            {results.stories.length === 0 && <p className="mt-3 text-sm text-muted">No matching stories.</p>}
          </section>
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">Discussions</h2>
            <div className="mt-3 grid gap-3">
              {results.discussions.map((discussion) => (
                <DiscussionCard key={discussion.slug} discussion={discussion} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">Authors</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {results.authors.map((author) => (
                <li key={author.id}>
                  <Link href={`/search?q=${encodeURIComponent(author.name)}`}>{author.name}</Link>
                  {author.title ? <span className="text-muted"> · {author.title}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
