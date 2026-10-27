import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRelative } from "@/lib/format";

export default async function EditorHome() {
  const [drafts, review, submissions, ideas, reports, published] = await Promise.all([
    prisma.story.findMany({ where: { status: "DRAFT" }, include: { author: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.story.findMany({ where: { status: "IN_REVIEW" }, include: { author: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.articleSubmission.findMany({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.ideaSubmission.findMany({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.report.findMany({ where: { status: "OPEN" }, take: 5, orderBy: { createdAt: "desc" } }),
    prisma.story.findMany({ where: { status: "PUBLISHED" }, include: { author: true }, orderBy: { publishedAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <h1 className="display text-4xl">Overview</h1>
      <p className="mt-2 text-sm text-muted">Write, review, publish. Keep the public site out of this room.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel title="Drafts" href="/editor/stories?status=DRAFT">
          {drafts.map((story) => (
            <Row key={story.id} href={`/editor/stories/${story.id}`} title={story.title} meta={`${story.author.name} · ${formatRelative(story.updatedAt)}`} />
          ))}
        </Panel>
        <Panel title="Needs Review" href="/editor/stories?status=IN_REVIEW">
          {review.map((story) => (
            <Row key={story.id} href={`/editor/stories/${story.id}`} title={story.title} meta={story.author.name} />
          ))}
        </Panel>
        <Panel title="Submissions" href="/editor/submissions">
          {submissions.map((item) => (
            <Row key={item.id} href="/editor/submissions" title={item.title} meta={item.name} />
          ))}
        </Panel>
        <Panel title="Ideas" href="/editor/ideas">
          {ideas.map((item) => (
            <Row key={item.id} href="/editor/ideas" title={item.topic} meta={item.name} />
          ))}
        </Panel>
        <Panel title="Discussion Activity" href="/editor/discussions">
          {reports.length === 0 ? <p className="text-sm text-muted">No open reports.</p> : reports.map((item) => (
            <Row key={item.id} href="/editor/discussions" title={item.reason} meta={formatRelative(item.createdAt)} />
          ))}
        </Panel>
        <Panel title="Recently Published" href="/editor/stories?status=PUBLISHED">
          {published.map((story) => (
            <Row key={story.id} href={`/editor/stories/${story.id}`} title={story.title} meta={story.author.name} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.3rem] border border-line p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        <Link href={href} className="text-xs text-purple">
          Open
        </Link>
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Row({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <Link href={href} className="block rounded-xl px-2 py-2 hover:bg-bg-elevated">
      <p className="text-sm">{title || "Untitled"}</p>
      <p className="text-xs text-faint">{meta}</p>
    </Link>
  );
}
