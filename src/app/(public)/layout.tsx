import { SiteHeader, MobileNav } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  return (
    <>
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileNav />
    </>
  );
}
