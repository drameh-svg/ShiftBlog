"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

export async function updateMemberRole(userId: string, role: Role) {
  await requireAdmin();
  z.enum(["PUBLIC", "EDITOR", "ADMIN"]).parse(role);
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/editor/team");
}

export async function createEditorAccount(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = z.enum(["EDITOR", "ADMIN"]).parse(String(formData.get("role") ?? "EDITOR"));
  if (name.length < 2 || !email.includes("@") || password.length < 8) {
    throw new Error("Name, USC/SHIFT email, and a password of at least 8 characters are required.");
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("That email is already on SHIFT.");
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      title: "SHIFT Public Policy editor",
    },
  });
  revalidatePath("/editor/team");
}
