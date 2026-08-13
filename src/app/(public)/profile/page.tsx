import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { CompactCard } from "@/components/stories/story-cards";
import { isEditorial } from "@/lib/permissions";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const saved = await prisma.savedStory.findMany({
    where: { userId: user.id },
    include: {
      story: {
        include: {
          author: { select: { id: true, name: true, title: true, avatarHue: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl">{user.name}</h1>
      <p className="mt-2 text-muted">{user.email}</p>
      <p className="mt-1 text-sm text-faint">Public account{user.title ? ` · ${user.title}` : ""}</p>
      {isEditorial(user.role) && (
        <p className="mt-4">
          <Link href="/editor" className="text-purple">
            Open SHIFT Editorial →
          </Link>
        </p>
      )}
      <form action={signOutAction} className="mt-6">
        <button className="rounded-full border border-line px-4 py-2 text-sm">Sign out</button>
      </form>
      <section className="mt-10">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">Saved stories</h2>
        {saved.map((item) => (
          <CompactCard key={item.storyId} story={item.story} />
        ))}
        {saved.length === 0 && <p className="mt-3 text-sm text-muted">No saved stories yet.</p>}
      </section>
    </div>
  );
}
