"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/guest";
import { isGuestEmail } from "@/lib/public-user";
import { appendSpreadsheetRow } from "@/lib/spreadsheet";

export async function castPollVote(pollId: string, optionId: string) {
  const user = await getActor();
  const option = await prisma.pollOption.findFirst({
    where: { id: optionId, pollId },
    include: { poll: { select: { question: true } } },
  });
  if (!option) return { error: "That option is not on this poll." };
  await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId: user.id } },
    create: { pollId, optionId, userId: user.id },
    update: { optionId },
  });
  try {
    const guest = isGuestEmail(user.email);
    await appendSpreadsheetRow({
      submittedAt: new Date().toISOString(),
      email: guest ? "" : user.email,
      name: guest ? "Anonymous" : user.name,
      question: option.poll.question,
      answer: option.label,
    });
  } catch (error) {
    console.error("Failed to append poll answer to spreadsheet", error);
  }
  revalidatePath("/involve");
  revalidatePath("/");
  revalidatePath("/editor/involve");
  return { ok: true };
}
