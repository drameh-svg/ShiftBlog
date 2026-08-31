"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDiscussionPost, castDiscussionVote } from "@/app/actions/discussion";
import { STANCE_LABELS, isStance, type Stance } from "@/lib/content";
import { formatRelative, initials } from "@/lib/format";

export type ChatMessage = {
  id: string;
  body: string;
  stance: string | null;
  createdAt: Date | string;
  user: { name: string; avatarHue: number };
};

export type StanceCounts = Record<Stance, number>;

const STANCE_COLORS: Record<Stance, string> = {
  FOR: "bg-lime/20 text-lime",
  AGAINST: "bg-purple/20 text-purple",
  UNSURE: "bg-fg/10 text-muted",
};

export function ChannelChat({
  discussionId,
  title,
  prompt,
  topicLabel,
  locked,
  userId,
  userStance,
  counts,
  messages,
}: {
  discussionId: string;
  title: string;
  prompt: string;
  topicLabel: string;
  locked: boolean;
  userId?: string;
  userStance: Stance | null;
  counts: StanceCounts;
  messages: ChatMessage[];
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [changing, setChanging] = useState(!userStance);
  const scroller = useRef<HTMLDivElement>(null);
  const total = counts.FOR + counts.AGAINST + counts.UNSURE;

  useEffect(() => {
    setChanging(!userStance);
  }, [userStance, discussionId]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length, discussionId]);

  const bar = useMemo(() => {
    if (!total) return { forPct: 34, againstPct: 33, unsurePct: 33 };
    return {
      forPct: Math.round((counts.FOR / total) * 100),
      againstPct: Math.round((counts.AGAINST / total) * 100),
      unsurePct: Math.round((counts.UNSURE / total) * 100),
    };
  }, [counts, total]);

  async function vote(choice: Stance) {
    setError(null);
    const result = await castDiscussionVote(discussionId, choice);
    if (result.error) setError(result.error);
    else setChanging(false);
  }

  async function send() {
    setError(null);
    const result = await addDiscussionPost(discussionId, body);
    if (result.error) setError(result.error);
    else setBody("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-line px-4 py-3 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-purple">{topicLabel}</p>
        <h1 className="display mt-1 text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{prompt}</p>
        <div className="mt-3">
          <div className="flex h-2 overflow-hidden rounded-full bg-line">
            <div className="bg-lime" style={{ width: `${bar.forPct}%` }} />
            <div className="bg-purple" style={{ width: `${bar.againstPct}%` }} />
            <div className="bg-faint/50" style={{ width: `${bar.unsurePct}%` }} />
          </div>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              <strong className="text-lime">{counts.FOR}</strong> For
            </span>
            <span>
              <strong className="text-purple">{counts.AGAINST}</strong> Against
            </span>
            <span>
              <strong>{counts.UNSURE}</strong> Still thinking
            </span>
            {userStance && (
              <span>
                You: <strong>{STANCE_LABELS[userStance]}</strong>
              </span>
            )}
          </p>
        </div>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && (
          <p className="text-sm text-muted">No messages yet. Take a stance, then open the thread.</p>
        )}
        {messages.map((message) => {
          const stance = isStance(message.stance) ? message.stance : null;
          return (
            <article key={message.id} className="flex gap-3">
              <span
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] text-white"
                style={{ background: `hsl(${message.user.avatarHue} 40% 32%)` }}
              >
                {initials(message.user.name)}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-medium">{message.user.name}</span>
                  {stance && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${STANCE_COLORS[stance]}`}>
                      {STANCE_LABELS[stance]}
                    </span>
                  )}
                  <time className="text-xs text-faint">{formatRelative(message.createdAt)}</time>
                </p>
                <p className="mt-1 text-[15px] leading-7">{message.body}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="discuss-composer border-t border-line px-4 py-3 sm:px-6">
        {locked ? (
          <p className="text-sm text-muted">This topic is locked.</p>
        ) : !userId ? (
          <p className="text-sm text-muted">
            <a href="/sign-in" className="text-purple">
              Sign in
            </a>{" "}
            to join this chat.
          </p>
        ) : changing || !userStance ? (
          <div>
            <p className="text-sm font-medium">Where do you stand on this before you speak?</p>
            <p className="mt-1 text-xs text-muted">Your stance stays next to every message you send.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["FOR", "AGAINST", "UNSURE"] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => vote(choice)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    userStance === choice ? "bg-fg text-bg" : "border border-line"
                  }`}
                >
                  {STANCE_LABELS[choice]}
                </button>
              ))}
            </div>
            {userStance && (
              <button type="button" onClick={() => setChanging(false)} className="mt-2 text-xs text-muted">
                Keep current stance
              </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await send();
            }}
          >
            <label htmlFor="chat-message" className="visually-hidden">
              Message
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="chat-message"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={2}
                className="min-h-[44px] w-full resize-none rounded-2xl border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-purple"
                placeholder={`Message as ${STANCE_LABELS[userStance]}…`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />
              <button type="submit" className="rounded-full bg-fg px-4 py-2 text-sm text-bg">
                Send
              </button>
            </div>
            <button type="button" onClick={() => setChanging(true)} className="mt-2 text-xs text-muted">
              Change stance
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
