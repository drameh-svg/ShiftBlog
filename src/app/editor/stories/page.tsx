import Link from "next/link";
import type { StoryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Search } from "@/lib/page-props";

export default async function EditorStoriesPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as StoryStatus) : undefined;
  const stories = await prisma.story.findMany({
    where: status ? { status } : {},
    include: { author: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="display text-4xl">Stories</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-faint">
            <tr>
              <th className="py-2">Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.id} className="border-t border-line">
                <td className="py-3">
                  <Link href={`/editor/stories/${story.id}`} className="hover:text-purple">
                    {story.title}
                  </Link>
                </td>
                <td className="text-muted">{story.status.replace("_", " ")}</td>
                <td>{story.author.name}</td>
                <td className="text-faint">{story.updatedAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
