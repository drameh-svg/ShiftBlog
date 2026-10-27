import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session-token";
import { GUEST_COOKIE, guestCookieOptions, isGuestKey } from "@/lib/guest-cookie";
import { isEditorial } from "@/lib/permissions";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const guest = request.cookies.get(GUEST_COOKIE)?.value;
  if (!isGuestKey(guest)) {
    response.cookies.set(GUEST_COOKIE, crypto.randomUUID(), guestCookieOptions());
  }

  if (!request.nextUrl.pathname.startsWith("/editor")) {
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (!session || !isEditorial(session.role)) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|webp|svg|ico)$).*)"],
};
