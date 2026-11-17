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
import { getRequestOrigin } from "@/lib/origin";
import { syncPublicUser } from "@/lib/public-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

const publicCredentials = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signUpAction(_: unknown, formData: FormData) {
  const parsed = publicCredentials.safeParse({
    name: String(formData.get("name") ?? "").trim() || undefined,
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Enter your name, a valid email, and a password of at least 8 characters." };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Email signup is not configured yet. Add the Supabase URL and anon key." };
  }
  const origin = await getRequestOrigin();
  const next = safeNextPath(formData.get("next")) ?? "/involve";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: { name: parsed.data.name ?? parsed.data.email.split("@")[0] },
    },
  });
  if (error) return { error: error.message };
  if (data.user?.email) {
    await syncPublicUser({
      email: data.user.email,
      name: parsed.data.name ?? null,
    });
  }
  if (data.session) {
    redirect(next);
  }
  return { ok: true, message: "Check your email to confirm your SHIFT account, then come back to vote." };
}

export async function publicSignInAction(_: unknown, formData: FormData) {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Email signup is not configured yet. Add the Supabase URL and anon key." };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  if (data.user?.email) {
    await syncPublicUser({
      email: data.user.email,
      name: typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : null,
    });
  }
  redirect(safeNextPath(formData.get("next")) ?? "/involve");
}

export async function signOutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
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
