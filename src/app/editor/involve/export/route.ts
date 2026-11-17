import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorial } from "@/lib/auth";
import { spreadsheetCsv } from "@/lib/spreadsheet";
import { isGuestEmail } from "@/lib/public-user";

export async function GET() {
  try {
    await requireEditorial();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const votes = await prisma.pollVote.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      option: { select: { label: true } },
      poll: { select: { question: true } },
    },
  });
  const csv = spreadsheetCsv(
    votes.map((vote) => {
      const guest = isGuestEmail(vote.user.email);
      return {
        submittedAt: vote.updatedAt.toISOString(),
        email: guest ? "" : vote.user.email,
        name: guest ? "Anonymous" : vote.user.name,
        question: vote.poll.question,
        answer: vote.option.label,
      };
    }),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shift-midterms-poll.csv"',
    },
  });
}
