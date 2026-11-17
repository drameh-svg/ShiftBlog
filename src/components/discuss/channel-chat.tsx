"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

const STANCE_ORDER = ["FOR", "AGAINST", "UNSURE"] as const;

function actionError(result: { error?: string } | undefined | null, fallback: string) {
  const message = result?.error?.trim();
  return message || fallback;
}

export function ChannelChat({
  discussionId,
  title,
  prompt,
  topicLabel,
  locked,
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
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [localStance, setLocalStance] = useState<Stance | null>(userStance);
  const [changing, setChanging] = useState(!userStance);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [localCounts, setLocalCounts] = useState(counts);
  const scroller = useRef<HTMLDivElement>(null);
  const stance = localStance;
  const total = localCounts.FOR + localCounts.AGAINST + localCounts.UNSURE;
  const shownMessages = useMemo(() => {
    const seen = new Set(messages.map((message) => message.id));
    return [...messages, ...localMessages.filter((message) => !seen.has(message.id))];
  }, [messages, localMessages]);

  useEffect(() => {
    if (userStance) {
      setLocalStance(userStance);
      setChanging(false);
    }
  }, [userStance, discussionId]);

  useEffect(() => {
    setLocalCounts(counts);
  }, [counts, discussionId]);

  useEffect(() => {
    setLocalMessages([]);
  }, [discussionId]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [shownMessages.length, discussionId]);

  const bar = useMemo(() => {
    if (!total) return { forPct: 34, againstPct: 33, unsurePct: 33 };
    return {
      forPct: Math.round((localCounts.FOR / total) * 100),
      againstPct: Math.round((localCounts.AGAINST / total) * 100),
      unsurePct: Math.round((localCounts.UNSURE / total) * 100),
    };
  }, [localCounts, total]);

  async function vote(choice: Stance) {
    setError(null);
    const previous = localStance;
    setLocalStance(choice);
    setChanging(false);
    setLocalCounts((current) => {
      const next = { ...current };
      if (previous && previous !== choice) next[previous] = Math.max(0, next[previous] - 1);
      if (previous !== choice) next[choice] += 1;
      return next;
    });
    try {
      const result = await castDiscussionVote(discussionId, choice);
      if (result?.error) {
        setError(actionError(result, "Could not save your stance. Try again."));
        setLocalStance(previous);
        setChanging(!previous);
        setLocalCounts(counts);
      }
    } catch {
      setError("Could not save your stance. Try again.");
      setLocalStance(previous);
      setChanging(!previous);
      setLocalCounts(counts);
    }
  }

  async function send() {
    if (!stance) {
      setChanging(true);
      setError("Pick a stance on this topic before you send a message.");
      return;
    }
    const text = body.trim();
    if (text.length < 2) {
      setError("Add a complete thought.");
      return;
    }
    setError(null);
    setPending(true);
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      body: text,
      stance,
      createdAt: new Date().toISOString(),
      user: { name: "Anonymous", avatarHue: 260 },
    };
    setLocalMessages((current) => [...current, optimistic]);
    setBody("");
    try {
      const result = await addDiscussionPost(discussionId, text, stance);
      if (result?.error) {
        setLocalMessages((current) => current.filter((message) => message.id !== optimistic.id));
        setBody(text);
        setError(actionError(result, "Could not send that message. Try again."));
        return;
      }
      if (result?.id) {
        setLocalMessages((current) =>
          current.map((message) => (message.id === optimistic.id ? { ...message, id: `post-${result.id}` } : message)),
        );
      }
      router.refresh();
    } catch {
      setLocalMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setBody(text);
      setError("Could not send that message. Try again.");
    } finally {
      setPending(false);
    }
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
            {STANCE_ORDER.map((choice) => (
              <span key={choice}>
                <strong className={choice === "FOR" ? "text-lime" : choice === "AGAINST" ? "text-purple" : ""}>
                  {localCounts[choice]}
                </strong>{" "}
                {STANCE_LABELS[choice]}
              </span>
            ))}
            {stance && (
              <span>
                You: <strong>{STANCE_LABELS[stance]}</strong>
              </span>
            )}
          </p>
        </div>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {shownMessages.length === 0 && (
          <p className="text-sm text-muted">No messages yet. Take a stance, then open the thread.</p>
        )}
        {shownMessages.map((message) => {
          const messageStance = isStance(message.stance) ? message.stance : null;
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
                  {messageStance && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${STANCE_COLORS[messageStance]}`}>
                      {STANCE_LABELS[messageStance]}
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
        ) : changing || !stance ? (
          <div>
            <p className="text-sm font-medium">Where do you stand on this before you speak?</p>
            <p className="mt-1 text-xs text-muted">Your stance stays next to every message you send.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STANCE_ORDER.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => vote(choice)}
                  disabled={pending}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    stance === choice ? "bg-fg text-bg" : "border border-line"
                  }`}
                >
                  {STANCE_LABELS[choice]}
                </button>
              ))}
            </div>
            {stance && (
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
                placeholder={`Message as ${STANCE_LABELS[stance]}…`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />
              <button type="submit" disabled={pending || !body.trim()} className="rounded-full bg-fg px-4 py-2 text-sm text-bg disabled:opacity-50">
                Send
              </button>
            </div>
            <button type="button" onClick={() => setChanging(true)} className="mt-2 text-xs text-muted">
              Change stance
            </button>
          </form>
        )}
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
