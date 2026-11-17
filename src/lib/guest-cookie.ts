export const GUEST_COOKIE = "shift_guest";

export function isGuestKey(value: string | undefined | null): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

export function guestCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "0" ? false : process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}
