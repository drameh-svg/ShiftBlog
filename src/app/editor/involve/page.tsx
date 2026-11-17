import { prisma } from "@/lib/prisma";
import { saveOpportunity } from "@/app/actions/opportunities";
import { StatusBadge } from "@/components/involve/opportunity-card";
import { formatDate } from "@/lib/format";
import { isGuestEmail } from "@/lib/public-user";

export default async function EditorInvolvePage() {
  const [opportunities, pollVotes] = await Promise.all([
    prisma.opportunity.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.pollVote.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        option: { select: { label: true } },
        poll: { select: { question: true } },
      },
    }),
  ]);
  const votes = pollVotes.filter((vote) => !isGuestEmail(vote.user.email));

  return (
    <div>
      <h1 className="display text-4xl">Get Involved</h1>
      <p className="mt-2 text-sm text-muted">
        Poll answers are stored as a spreadsheet here and downloaded as CSV. If GOOGLE_SHEETS_WEBHOOK_URL is set, each vote is also appended to that Google Sheet.
      </p>

      <section className="mt-8 overflow-hidden rounded-[1.2rem] border border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-medium">Midterms poll spreadsheet</h2>
          <a href="/editor/involve/export" className="rounded-full border border-line px-3 py-1.5 text-xs">
            Download CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.12em] text-faint">
              <tr>
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Question</th>
                <th className="px-4 py-2 font-medium">Answer</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote) => (
                <tr key={vote.id} className="border-t border-line">
                  <td className="px-4 py-2 text-muted">{formatDate(vote.updatedAt)}</td>
                  <td className="px-4 py-2">{vote.user.email}</td>
                  <td className="px-4 py-2">{vote.user.name}</td>
                  <td className="px-4 py-2 text-muted">{vote.poll.question}</td>
                  <td className="px-4 py-2">{vote.option.label}</td>
                </tr>
              ))}
              {votes.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-muted" colSpan={5}>
                    No poll answers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <form action={saveOpportunity.bind(null, null)} className="mt-10 grid gap-3 rounded-[1.2rem] border border-line p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 text-sm font-medium">New opportunity</h2>
        <input name="title" required placeholder="Title" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
        <select name="type" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm">
          {["PANEL", "LEADERSHIP", "PETITION", "MEETING", "PUBLIC_COMMENT", "RESEARCH", "INITIATIVE"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input name="organizer" required placeholder="Organizer" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
        <input name="dateLabel" placeholder="Date label" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
        <input name="location" placeholder="Location" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
        <select name="status" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm">
          {["OPEN", "UPCOMING", "CLOSING_SOON", "ONGOING", "COMPLETED"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input name="ctaLabel" defaultValue="Learn More" className="rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
        <textarea name="description" required placeholder="Short description" className="md:col-span-2 rounded-xl border border-line bg-transparent px-3 py-2 text-sm" />
        <textarea name="body" required placeholder="Full details" className="md:col-span-2 rounded-xl border border-line bg-transparent px-3 py-2 text-sm" rows={4} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="urgent" /> Urgent / homepage
        </label>
        <button className="rounded-full bg-fg px-4 py-2 text-sm text-bg">Create</button>
      </form>
      <ul className="mt-8 space-y-3">
        {opportunities.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
            <div>
              <p>{item.title}</p>
              <p className="text-xs text-muted">{item.organizer}</p>
            </div>
            <StatusBadge status={item.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
