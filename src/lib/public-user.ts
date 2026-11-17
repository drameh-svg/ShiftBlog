import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function syncPublicUser(input: {
  email?: string | null;
  name?: string | null;
}) {
  const email = input.email?.trim().toLowerCase();
  if (!email) return null;
  const existing = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      title: true,
      bio: true,
      avatarHue: true,
    },
  });
  if (existing) return existing;
  const name = input.name?.trim() || email.split("@")[0] || "Student";
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
      role: "PUBLIC",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      title: true,
      bio: true,
      avatarHue: true,
    },
  });
}

export function isGuestEmail(email: string) {
  return email.endsWith("@shift.local");
}
