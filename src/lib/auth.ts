import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { isEditorial } from "./permissions";
import { SESSION_COOKIE, createSessionToken, readSessionToken } from "./session-token";
import type { SessionUser } from "./session-types";
import { createServerSupabaseClient } from "./supabase/server";
import { syncPublicUser } from "./public-user";

export type { SessionUser } from "./session-types";
export { SESSION_COOKIE, createSessionToken, readSessionToken };

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  title: true,
  bio: true,
  avatarHue: true,
} as const;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function getEditorialSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

async function getSupabaseSession(): Promise<SessionUser | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return null;
  const user = await syncPublicUser({
    email: data.user.email,
    name: typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : null,
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    title: user.title,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  return (await getEditorialSession()) ?? (await getSupabaseSession());
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.id },
    select: userSelect,
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
