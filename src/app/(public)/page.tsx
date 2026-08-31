import Link from "next/link";
import { Atmosphere } from "@/components/layout/atmosphere";
import { EditorialVisual } from "@/components/stories/editorial-visual";
import {
  BriefCard,
  CategoryChip,
  CompactCard,
  FeatureCard,
  HorizontalCard,
  StoryMeta,
  TextStory,
} from "@/components/stories/story-cards";
import { DiscussionCard } from "@/components/discuss/discussion-card";
import { OpportunityCard } from "@/components/involve/opportunity-card";
import { prisma } from "@/lib/prisma";
import { getLeadStory, getPublishedStories } from "@/lib/queries";

export default async function HomePage() {
  const [lead, latest, discussions, opportunities] = await Promise.all([
    getLeadStory(),
    getPublishedStories({ take: 16 }),
    prisma.discussion.findMany({
      include: {
        creator: { select: { name: true } },
        _count: { select: { posts: true, arguments: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    prisma.opportunity.findMany({
      where: { status: { in: ["OPEN", "CLOSING_SOON", "UPCOMING", "ONGOING"] } },
      orderBy: [{ urgent: "desc" }, { deadline: "asc" }],
      take: 3,
    }),
  ]);

  const rest = latest.filter((story) => story.id !== lead?.id);
  const campus = rest.filter((story) => story.category === "CAMPUS");
  const opinion = rest.filter((story) => story.category === "OPINION");
  const briefs = rest.filter((story) => story.isBrief || story.category === "NEWS" || story.category === "EXPLAINER");
  const featured = rest.filter((story) => story.featured);

  return (
    <div>
      <section className="relative overflow-hidden">
        <Atmosphere />
        <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
          {lead ? (
            <>
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-lime">
                  {lead.tags.map((item) => item.tag.name).slice(0, 2).join(" · ")}
                </p>
                <h1 className="display mt-4 max-w-xl text-[clamp(2.8rem,7vw,5.4rem)]">
                  {lead.title}
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-muted">{lead.dek}</p>
                <StoryMeta story={lead} />
                <Link
                  href={`/stories/${lead.slug}`}
                  className="mt-8 inline-flex rounded-full bg-lime px-5 py-3 text-sm font-medium text-[#142006]"
                >
                  Read the Story →
                </Link>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-purple/20 blur-3xl" aria-hidden />
                <EditorialVisual
                  theme={lead.visualTheme}
                  className="relative h-[320px] rounded-[2rem] border border-white/10 sm:h-[420px]"
                />
              </div>
            </>
          ) : (
            <div>
              <h1 className="display text-5xl">SHIFT Public Policy</h1>
              <p className="mt-4 text-muted">Stories are being prepared.</p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-faint">Latest</h2>
            <div className="mt-2">
              {rest.slice(0, 4).map((story) => (
                <CompactCard key={story.id} story={story} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-faint">Campus</h2>
            <div className="mt-4">
              {campus[0] ? <FeatureCard story={campus[0]} /> : featured[0] && <FeatureCard story={featured[0]} />}
            </div>
          </div>
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-faint">Op-eds</h2>
            <div className="mt-4 space-y-4">
              {(opinion[0] ? opinion : rest.slice(4, 6)).slice(0, 2).map((story) => (
                <TextStory key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl">The Brief</h2>
            <Link href="/read?category=NEWS" className="text-sm text-purple">
              See What’s Happening at USC →
            </Link>
          </div>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
            {briefs.slice(0, 5).map((story) => (
              <BriefCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        <section className="py-14">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl">Trending Discussions</h2>
            <Link href="/discuss" className="text-sm text-purple">
              Join the Discussion →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {discussions.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>
        </section>

        <section className="py-6">
          <div className="flex items-end justify-between">
            <h2 className="display text-3xl">Get Involved</h2>
            <Link href="/involve" className="text-sm text-purple">
              Make Your Voice Heard →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </section>

        {rest[5] && (
          <section className="py-10">
            <CategoryChip category={rest[5].category} />
            <HorizontalCard story={rest[5]} />
          </section>
        )}

        <section className="relative my-10 overflow-hidden rounded-[2rem] border border-line px-6 py-12 sm:px-12">
          <Atmosphere />
          <div className="relative max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Have something to say?</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">SHIFT publishes student thinking that the institution needs to hear.</h2>
            <p className="mt-4 text-muted">
              Submit an idea we should investigate, or send writing for editorial review.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/submit/idea" className="rounded-full bg-lime px-5 py-3 text-sm font-medium text-[#142006]">
                Submit an Idea →
              </Link>
              <Link href="/submit/writing" className="rounded-full border border-line px-5 py-3 text-sm">
                Write for SHIFT →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
