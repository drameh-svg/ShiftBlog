import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DiscussPage() {
  const first = await prisma.discussion.findFirst({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    select: { slug: true },
  });
  if (first) redirect(`/discuss/${first.slug}`);
  return (
    <div className="grid h-full place-items-center px-6 text-center">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Discuss</p>
        <h1 className="display mt-2 text-3xl">No topics yet</h1>
        <p className="mt-2 text-sm text-muted">Start a channel from the sidebar once you sign in.</p>
      </div>
    </div>
  );
}
