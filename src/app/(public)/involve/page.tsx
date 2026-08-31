import { prisma } from "@/lib/prisma";
import { OpportunityCard } from "@/components/involve/opportunity-card";
import type { OpportunityType } from "@prisma/client";
import type { Search } from "@/lib/page-props";

const TYPES: { id: string; label: string; value?: OpportunityType }[] = [
  { id: "all", label: "All" },
  { id: "panel", label: "Sit In on a Panel", value: "PANEL" },
  { id: "leadership", label: "Speak With Leadership", value: "LEADERSHIP" },
  { id: "petition", label: "Sign a Petition", value: "PETITION" },
  { id: "meeting", label: "Attend a Meeting", value: "MEETING" },
  { id: "comment", label: "Public Comment", value: "PUBLIC_COMMENT" },
  { id: "research", label: "Research", value: "RESEARCH" },
  { id: "initiative", label: "SHIFT Initiative", value: "INITIATIVE" },
];

export default async function InvolvePage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const type = TYPES.find((item) => item.id === params.type);
  const opportunities = await prisma.opportunity.findMany({
    where: type?.value ? { type: type.value } : {},
    orderBy: [{ status: "asc" }, { urgent: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Get Involved</p>
      <h1 className="display mt-2 max-w-3xl text-5xl">How USC students actually get a say.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        Policy is not only an article. It is a meeting, a petition, a comment window, a seat in the room. These are live ways to influence technology decisions on campus.
      </p>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {TYPES.map((item) => (
          <a
            key={item.id}
            href={item.id === "all" ? "/involve" : `/involve?type=${item.id}`}
            className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${(!params.type && item.id === "all") || params.type === item.id ? "bg-fg text-bg" : "border border-line text-muted"}`}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    </div>
  );
}
