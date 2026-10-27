import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { isEditorial } from "./permissions";
import { SESSION_COOKIE, createSessionToken, readSessionToken } from "./session-token";
import type { SessionUser } from "./session-types";

export type { SessionUser } from "./session-types";
export { SESSION_COOKIE, createSessionToken, readSessionToken };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.id },
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

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireEditorial() {
  const user = await getCurrentUser();
  if (!user || !isEditorial(user.role)) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}
