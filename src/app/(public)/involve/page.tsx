import { prisma } from "@/lib/prisma";
import { findActor } from "@/lib/guest";
import { MidtermPoll } from "@/components/involve/midterm-poll";

export default async function InvolvePage() {
  const [poll, actor] = await Promise.all([
    prisma.poll.findUnique({
      where: { slug: "2026-midterms" },
      include: {
        options: {
          orderBy: { sort: "asc" },
          include: { _count: { select: { votes: true } } },
        },
      },
    }),
    findActor(),
  ]);
  const vote = poll && actor
    ? await prisma.pollVote.findUnique({
        where: { pollId_userId: { pollId: poll.id, userId: actor.id } },
        select: { optionId: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Get Involved</p>
      <h1 className="display type-texture mt-2 max-w-3xl text-5xl">Make your voice heard</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        The 2026 midterms asked students to show up. Tell SHIFT whether you voted — no account required.
      </p>
      <div className="mt-10">
        {poll ? (
          <MidtermPoll
            pollId={poll.id}
            question={poll.question}
            selectedOptionId={vote?.optionId ?? null}
            options={poll.options.map((option) => ({
              id: option.id,
              label: option.label,
              votes: option._count.votes,
            }))}
          />
        ) : (
          <p className="text-muted">The midterms poll will open here shortly.</p>
        )}
      </div>
    </div>
  );
}
