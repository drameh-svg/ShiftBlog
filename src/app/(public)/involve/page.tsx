import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isGuestEmail } from "@/lib/public-user";
import { MidtermPoll } from "@/components/involve/midterm-poll";
import { EmailSignupForm } from "@/components/auth/email-signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function InvolvePage() {
  const [poll, user] = await Promise.all([
    prisma.poll.findUnique({
      where: { slug: "2026-midterms" },
      include: {
        options: {
          orderBy: { sort: "asc" },
          include: { _count: { select: { votes: true } } },
        },
      },
    }),
    getCurrentUser(),
  ]);
  const signedIn = Boolean(user && !isGuestEmail(user.email));
  const vote = poll && signedIn && user
    ? await prisma.pollVote.findUnique({
        where: { pollId_userId: { pollId: poll.id, userId: user.id } },
        select: { optionId: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Get Involved</p>
      <h1 className="display mt-2 max-w-3xl text-5xl">Make your voice heard</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        The 2026 midterms asked students to show up. Sign up with your email, then tell SHIFT whether you voted. Each answer is added to the editorial spreadsheet.
      </p>
      <div className="mt-10">
        {poll ? (
          <MidtermPoll
            pollId={poll.id}
            question={poll.question}
            selectedOptionId={vote?.optionId ?? null}
            signedIn={signedIn}
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
      {!signedIn && (
        <section className="mt-8 rounded-[1.8rem] border border-line p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-purple">Email signup</p>
          <h2 className="display mt-3 text-3xl">Sign up to vote</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            SHIFT uses Supabase Auth. Your email is stored with your poll answer on the spreadsheet — not published on the site.
          </p>
          {!isSupabaseConfigured() && (
            <p className="mt-4 text-sm text-danger">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable email signup.
            </p>
          )}
          <EmailSignupForm next="/involve" compact />
        </section>
      )}
    </div>
  );
}
