import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getCurrentUser, hashPassword } from "./auth";
import { GUEST_COOKIE, guestCookieOptions, isGuestKey } from "./guest-cookie";

export { GUEST_COOKIE } from "./guest-cookie";

function guestEmail(key: string) {
  return `guest.${key}@shift.local`;
}

export async function readGuestKey() {
  const jar = await cookies();
  const value = jar.get(GUEST_COOKIE)?.value ?? "";
  return isGuestKey(value) ? value : null;
}

export async function findGuestUser() {
  const key = await readGuestKey();
  if (!key) return null;
  return prisma.user.findUnique({
    where: { email: guestEmail(key) },
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

export async function getGuestUser() {
  const jar = await cookies();
  let key = await readGuestKey();
  if (!key) {
    key = crypto.randomUUID();
    jar.set(GUEST_COOKIE, key, guestCookieOptions());
  }
  const email = guestEmail(key);
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
  const hue = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  return prisma.user.create({
    data: {
      email,
      name: "Anonymous",
      passwordHash: await hashPassword(crypto.randomUUID()),
      role: "PUBLIC",
      avatarHue: hue,
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

export async function findActor() {
  return (await getCurrentUser()) ?? (await findGuestUser());
}

export async function getActor() {
  return (await getCurrentUser()) ?? (await getGuestUser());
}
