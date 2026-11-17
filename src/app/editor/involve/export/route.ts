import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorial } from "@/lib/auth";
import { spreadsheetCsv } from "@/lib/spreadsheet";

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
    votes.map((vote) => ({
      submittedAt: vote.updatedAt.toISOString(),
      email: vote.user.email,
      name: vote.user.name,
      question: vote.poll.question,
      answer: vote.option.label,
    })),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shift-midterms-poll.csv"',
    },
  });
}
