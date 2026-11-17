"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/guest";

export async function castPollVote(pollId: string, optionId: string) {
  const user = await getActor();
  const option = await prisma.pollOption.findFirst({
    where: { id: optionId, pollId },
    select: { id: true },
  });
  if (!option) return { error: "That option is not on this poll." };
  await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId: user.id } },
    create: { pollId, optionId, userId: user.id },
    update: { optionId },
  });
  revalidatePath("/involve");
  revalidatePath("/");
  return { ok: true };
}
