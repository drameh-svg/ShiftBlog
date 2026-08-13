import Link from "next/link";
import { formatRelative } from "@/lib/format";

export type DiscussionCardData = {
  slug: string;
  title: string;
  prompt: string;
  topic: string;
  isDebate: boolean;
  tags: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creator: { name: string };
  _count: { posts: number; arguments: number };
};

export function DiscussionCard({ discussion }: { discussion: DiscussionCardData }) {
  const tags = safeTags(discussion.tags);
  const responses = discussion.isDebate ? discussion._count.arguments : discussion._count.posts;
  return (
    <Link
      href={`/discuss/${discussion.slug}`}
      className="card-hover block rounded-[1.4rem] border border-line p-5"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-purple">
        <span>{discussion.isDebate ? "Debate" : discussion.topic.toLowerCase()}</span>
      </div>
      <h3 className="mt-2 text-xl leading-snug tracking-[-0.03em]">{discussion.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{discussion.prompt}</p>
      <p className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        <span>{discussion.creator.name}</span>
        <span>{responses} responses</span>
        <span>{formatRelative(discussion.updatedAt)}</span>
      </p>
      {tags.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-faint">
              {tag}
            </span>
          ))}
        </p>
      )}
    </Link>
  );
}

export function safeTags(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
