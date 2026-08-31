"use client";

import { useState } from "react";
import { addDebateArgument, addDiscussionPost, reactToArgument } from "@/app/actions/discussion";
import { formatRelative, initials } from "@/lib/format";

export function DiscussionThread({
  discussionId,
  locked,
  userId,
  posts,
}: {
  discussionId: string;
  locked: boolean;
  userId?: string;
  posts: {
    id: string;
    body: string;
    featured: boolean;
    createdAt: Date | string;
    user: { name: string; avatarHue: number };
  }[];
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {userId && !locked ? (
        <form
          className="rounded-[1.3rem] border border-line p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await addDiscussionPost(discussionId, body);
            if (result.error) setError(result.error);
            else setBody("");
          }}
        >
          <label htmlFor="post" className="text-sm font-medium">
            Add your perspective
          </label>
          <textarea
            id="post"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-line bg-transparent p-3 text-sm"
          />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <button className="mt-3 rounded-full bg-fg px-4 py-2 text-sm text-bg" type="submit">
            Add Your Perspective →
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">{locked ? "This discussion is locked." : "Sign in to participate."}</p>
      )}
      <ol className="mt-8 space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-[1.2rem] border border-line p-4">
            <p className="flex items-center gap-2 text-sm">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[10px] text-white"
                style={{ background: `hsl(${post.user.avatarHue} 40% 32%)` }}
              >
                {initials(post.user.name)}
              </span>
              {post.user.name}
              {post.featured && <span className="text-[11px] uppercase tracking-[0.14em] text-lime">Featured</span>}
              <span className="text-xs text-faint">{formatRelative(post.createdAt)}</span>
            </p>
            <p className="mt-3 leading-7">{post.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DebateBoard({
  discussionId,
  locked,
  userId,
  argumentsFor,
  argumentsAgainst,
}: {
  discussionId: string;
  locked: boolean;
  userId?: string;
  argumentsFor: DebateItem[];
  argumentsAgainst: DebateItem[];
}) {
  const total = argumentsFor.length + argumentsAgainst.length;
  const forPct = total ? Math.round((argumentsFor.length / total) * 100) : 50;
  const againstPct = 100 - forPct;

  return (
    <div>
      <div className="rounded-[1.4rem] border border-line p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Sentiment</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm">For {forPct}%</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-lime" style={{ width: `${forPct}%` }} />
            </div>
          </div>
          <div>
            <p className="text-sm">Against {againstPct}%</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-purple" style={{ width: `${againstPct}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ArgumentColumn
          title="For"
          side="FOR"
          items={argumentsFor}
          discussionId={discussionId}
          userId={userId}
          locked={locked}
        />
        <ArgumentColumn
          title="Against"
          side="AGAINST"
          items={argumentsAgainst}
          discussionId={discussionId}
          userId={userId}
          locked={locked}
        />
      </div>
    </div>
  );
}

type DebateItem = {
  id: string;
  body: string;
  createdAt: Date | string;
  user: { name: string };
  reactions: { type: string }[];
};

function ArgumentColumn({
  title,
  side,
  items,
  discussionId,
  userId,
  locked,
}: {
  title: string;
  side: "FOR" | "AGAINST";
  items: DebateItem[];
  discussionId: string;
  userId?: string;
  locked: boolean;
}) {
  const [body, setBody] = useState("");
  return (
    <section>
      <h2 className="display text-3xl">{title}</h2>
      <ol className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-[1.2rem] border border-line p-4">
            <p className="text-sm text-muted">{item.user.name}</p>
            <p className="mt-2 leading-7">{item.body}</p>
            <div className="mt-3 flex gap-2 text-xs">
              <button type="button" onClick={() => reactToArgument(item.id, "support")} className="rounded-full border border-line px-2 py-1">
                Support {item.reactions.filter((r) => r.type === "support").length}
              </button>
              <button type="button" onClick={() => reactToArgument(item.id, "challenge")} className="rounded-full border border-line px-2 py-1">
                Challenge {item.reactions.filter((r) => r.type === "challenge").length}
              </button>
            </div>
          </li>
        ))}
      </ol>
      {userId && !locked && (
        <form
          className="mt-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await addDebateArgument(discussionId, side, body);
            setBody("");
          }}
        >
          <label className="text-sm" htmlFor={`${side}-arg`}>
            Add an argument
          </label>
          <textarea
            id={`${side}-arg`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-transparent p-3 text-sm"
            rows={3}
          />
          <button className="mt-2 rounded-full bg-fg px-4 py-2 text-sm text-bg" type="submit">
            Add argument
          </button>
        </form>
      )}
    </section>
  );
}
