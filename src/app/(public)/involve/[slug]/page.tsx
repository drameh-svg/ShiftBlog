import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/involve/opportunity-card";
import { formatDate } from "@/lib/format";
import type { SlugParams } from "@/lib/page-props";

export default async function OpportunityPage({ params }: { params: SlugParams }) {
  const { slug } = await params;
  const opportunity = await prisma.opportunity.findUnique({ where: { slug } });
  if (!opportunity) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <StatusBadge status={opportunity.status} />
      <h1 className="display mt-4 text-4xl sm:text-5xl">{opportunity.title}</h1>
      <p className="mt-4 text-lg text-muted">{opportunity.description}</p>
      <dl className="mt-8 grid gap-3 rounded-[1.4rem] border border-line p-5 text-sm sm:grid-cols-2">
        {opportunity.dateLabel && (
          <div>
            <dt className="text-faint">Date</dt>
            <dd>{opportunity.dateLabel}</dd>
          </div>
        )}
        {opportunity.location && (
          <div>
            <dt className="text-faint">Location</dt>
            <dd>{opportunity.location}</dd>
          </div>
        )}
        <div>
          <dt className="text-faint">Organizer</dt>
          <dd>{opportunity.organizer}</dd>
        </div>
        {opportunity.deadline && (
          <div>
            <dt className="text-faint">Deadline</dt>
            <dd>{formatDate(opportunity.deadline)}</dd>
          </div>
        )}
        {opportunity.eligibility && (
          <div className="sm:col-span-2">
            <dt className="text-faint">Eligibility</dt>
            <dd>{opportunity.eligibility}</dd>
          </div>
        )}
      </dl>
      <div className="prose-shift mt-8 text-lg leading-8">
        {opportunity.body.split("\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {opportunity.ctaHref ? (
        <a href={opportunity.ctaHref} className="mt-8 inline-flex rounded-full bg-lime px-5 py-3 text-sm font-medium text-[#142006]">
          {opportunity.ctaLabel} →
        </a>
      ) : (
        <p className="mt-8 text-sm text-muted">
          Use the details above to {opportunity.ctaLabel.toLowerCase()}. SHIFT lists the opportunity; the organizer runs the action.
        </p>
      )}
    </div>
  );
}
