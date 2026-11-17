import { headers } from "next/headers";

export async function getRequestOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}
