import { prisma } from "@/lib/prisma";
import { hideComment, lockDiscussion, reviewReport } from "@/app/actions/discussion";

export default async function EditorDiscussionsPage() {
  const [reports, discussions, comments] = await Promise.all([
    prisma.report.findMany({
      where: { status: "OPEN" },
      include: { reporter: true, comment: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.discussion.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.comment.findMany({
      where: { hidden: false },
      include: { user: true, story: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="display text-4xl">Discussions</h1>
        <h2 className="mt-8 text-sm uppercase tracking-[0.14em] text-faint">Open reports</h2>
        <div className="mt-3 space-y-3">
          {reports.map((report) => (
            <article key={report.id} className="rounded-xl border border-line p-4 text-sm">
              <p>{report.reason} · {report.reporter.name}</p>
              {report.comment && <p className="mt-2 text-muted">{report.comment.body}</p>}
              <div className="mt-2 flex gap-2">
                <form action={async () => { "use server"; await reviewReport(report.id, "REVIEWED"); }}>
                  <button className="text-purple">Mark reviewed</button>
                </form>
                <form action={async () => { "use server"; await reviewReport(report.id, "DISMISSED"); }}>
                  <button>Dismiss</button>
                </form>
              </div>
            </article>
          ))}
          {reports.length === 0 && <p className="text-sm text-muted">No open reports.</p>}
        </div>
      </section>
      <section>
        <h2 className="text-sm uppercase tracking-[0.14em] text-faint">Lock discussions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {discussions.map((discussion) => (
            <li key={discussion.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
              <span>{discussion.title}</span>
              <form action={async () => { "use server"; await lockDiscussion(discussion.id, !discussion.locked); }}>
                <button className="text-purple">{discussion.locked ? "Unlock" : "Lock"}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm uppercase tracking-[0.14em] text-faint">Recent notes</h2>
        <ul className="mt-3 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-line p-3 text-sm">
              <p className="text-faint">{comment.user.name} on {comment.story.title}</p>
              <p className="mt-1">{comment.body}</p>
              <form action={async () => { "use server"; await hideComment(comment.id); }}>
                <button className="mt-2 text-xs text-danger">Hide</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
