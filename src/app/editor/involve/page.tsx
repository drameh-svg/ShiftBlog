import { prisma } from "@/lib/prisma";
import { saveOpportunity } from "@/app/actions/opportunities";
import { StatusBadge } from "@/components/involve/opportunity-card";

export default async function EditorInvolvePage() {
  const opportunities = await prisma.opportunity.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <h1 className="display text-4xl">Get Involved</h1>
      <form action={saveOpportunity.bind(null, null)} className="mt-6 grid gap-3 rounded-[1.2rem] border border-line p-5 md:grid-cols-2">
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
