"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  createSessionToken,
  getCurrentUser,
  verifyPassword,
} from "@/lib/auth";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function safeNextPath(value: unknown) {
  const next = String(value ?? "").trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}

async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "0" ? false : process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function signInAction(_: unknown, formData: FormData) {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.role === "PUBLIC" || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Those credentials do not match a SHIFT editorial account." };
  }
  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    title: user.title,
  });
  await setSessionCookie(token);
  const next = safeNextPath(formData.get("next"));
  redirect(next ?? "/editor");
}

export async function signUpAction() {
  return { error: "SHIFT no longer uses public accounts. Discuss and comment anonymously." };
}

export async function signOutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}

export async function saveStoryAction(storyId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to save stories." };
  const existing = await prisma.savedStory.findUnique({
    where: { userId_storyId: { userId: user.id, storyId } },
  });
  if (existing) {
    await prisma.savedStory.delete({ where: { userId_storyId: { userId: user.id, storyId } } });
    return { saved: false };
  }
  await prisma.savedStory.create({ data: { userId: user.id, storyId } });
  return { saved: true };
}
