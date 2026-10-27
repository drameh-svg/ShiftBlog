import Link from "next/link";
import type { OpportunityStatus, OpportunityType } from "@prisma/client";
import { formatDate } from "@/lib/format";

const STATUS: Record<OpportunityStatus, string> = {
  OPEN: "Open",
  UPCOMING: "Upcoming",
  CLOSING_SOON: "Closing Soon",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

const TYPE: Record<OpportunityType, string> = {
  PANEL: "Sit In on a Panel",
  LEADERSHIP: "Speak With Leadership",
  PETITION: "Sign a Petition",
  MEETING: "Attend a Public Meeting",
  PUBLIC_COMMENT: "Submit Public Comment",
  RESEARCH: "Participate in Research",
  INITIATIVE: "Join a SHIFT Initiative",
};

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  const urgent = status === "CLOSING_SOON" || status === "OPEN";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${urgent ? "bg-lime/20 text-lime" : "border border-line text-muted"}`}
    >
      {STATUS[status]}
    </span>
  );
}

export function OpportunityCard({
  opportunity,
}: {
  opportunity: {
    slug: string;
    title: string;
    type: OpportunityType;
    description: string;
    dateLabel: string | null;
    location: string | null;
    organizer: string;
    deadline: Date | string | null;
    status: OpportunityStatus;
    ctaLabel: string;
  };
}) {
  return (
    <article className="flex flex-col rounded-[1.5rem] border border-line p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-purple">{TYPE[opportunity.type]}</p>
        <StatusBadge status={opportunity.status} />
      </div>
      <h3 className="mt-3 text-xl leading-snug tracking-[-0.03em]">{opportunity.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{opportunity.description}</p>
      <ul className="mt-4 space-y-1 text-xs text-muted">
        {opportunity.dateLabel && <li>{opportunity.dateLabel}</li>}
        {opportunity.location && <li>{opportunity.location}</li>}
        <li>{opportunity.organizer}</li>
        {opportunity.deadline && <li>Deadline {formatDate(opportunity.deadline)}</li>}
      </ul>
      <Link
        href={`/involve/${opportunity.slug}`}
        className="mt-5 inline-flex w-fit rounded-full bg-fg px-4 py-2 text-sm text-bg"
      >
        {opportunity.ctaLabel}
      </Link>
    </article>
  );
}
