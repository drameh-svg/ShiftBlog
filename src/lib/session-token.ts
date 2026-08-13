import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import type { SessionUser } from "./session-types";

export const SESSION_COOKIE = "shift_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    title: user.title,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    const role = payload.role as Role;
    if (role !== "PUBLIC" && role !== "EDITOR" && role !== "ADMIN") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role,
      title: typeof payload.title === "string" ? payload.title : null,
    };
  } catch {
    return null;
  }
}
