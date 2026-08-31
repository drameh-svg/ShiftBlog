"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelative, initials } from "@/lib/format";
import { NOTE_COLORS } from "@/lib/content";
import { addComment, addCommentReply, reactToComment, reportComment } from "@/app/actions/discussion";

type Note = {
  id: string;
  body: string;
  color: string;
  posX: number;
  posY: number;
  rotation: number;
  featured: boolean;
  createdAt: Date | string;
  user: { id: string; name: string; avatarHue: number };
  replies: { id: string; body: string; createdAt: Date | string; user: { name: string } }[];
  reactions: { type: string; userId: string }[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function StickyDiscussion({
  storyId,
  notes,
  userId,
}: {
  storyId: string;
  notes: Note[];
  userId?: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"canvas" | "list">("canvas");
  const [body, setBody] = useState("");
  const [color, setColor] = useState<(typeof NOTE_COLORS)[number]>("cream");
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setView(media.matches ? "list" : "canvas");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const visible = useMemo(() => notes, [notes]);

  async function submit() {
    setError(null);
    const result = await addComment({
      storyId,
      body,
      color,
      posX: place?.x,
      posY: place?.y,
    });
    if (result.error) setError(result.error);
    else {
      setBody("");
      setPlace(null);
      router.refresh();
    }
  }

  return (
    <section className="mt-20 border-t border-line pt-12" id="discussion">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-lime">Discussion</p>
          <h2 className="display mt-2 text-4xl">What do you think?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Leave a note on the shared board. Switch to list view if you want a linear feed.
          </p>
        </div>
        <div className="glass inline-flex rounded-full p-1" role="tablist" aria-label="Discussion view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "canvas"}
            className={`rounded-full px-3 py-1.5 text-sm ${view === "canvas" ? "bg-fg text-bg" : ""}`}
            onClick={() => setView("canvas")}
          >
            Canvas View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={`rounded-full px-3 py-1.5 text-sm ${view === "list" ? "bg-fg text-bg" : ""}`}
            onClick={() => setView("list")}
          >
            List View
          </button>
        </div>
      </div>

      {userId ? (
        <div className="mt-8 rounded-[1.4rem] border border-line p-4">
          <label htmlFor="note" className="text-sm font-medium">
            Add a note
          </label>
          <textarea
            id="note"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-line bg-transparent p-3 text-sm outline-none focus:border-purple"
            placeholder="A thought, a challenge, a question…"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2" role="radiogroup" aria-label="Note color">
              {NOTE_COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={value}
                  onClick={() => setColor(value)}
                  className={`h-7 w-7 rounded-full note note-${value} ${color === value ? "ring-2 ring-fg" : ""}`}
                />
              ))}
            </div>
            <button type="button" onClick={submit} className="rounded-full bg-fg px-4 py-2 text-sm text-bg">
              Post note
            </button>
          </div>
          {view === "canvas" && (
            <p className="mt-2 text-xs text-faint">
              {place
                ? "Note will land where you clicked the board."
                : "Click the board to place your note, or we will pick a spot."}
            </p>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">
          <a href="/sign-in" className="text-purple">
            Sign in
          </a>{" "}
          to add a note to this story.
        </p>
      )}

      {view === "canvas" ? (
        <div
          className="note-board relative mt-8 h-[32rem] overflow-hidden rounded-[1.6rem] border border-dashed border-line sm:h-[36rem]"
          onClick={(event) => {
            if (!userId) return;
            if ((event.target as HTMLElement).closest("[data-note]")) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            setPlace({ x: clamp(x, 2, 72), y: clamp(y, 2, 68) });
          }}
        >
          {visible.map((note) => (
            <article
              key={note.id}
              data-note
              className={`note note-${note.color} absolute z-10 w-[min(14rem,calc(100%-1.25rem))] p-3 text-sm`}
              style={{
                left: `clamp(0.75rem, ${clamp(note.posX, 3, 70)}%, calc(100% - 15rem))`,
                top: `clamp(0.75rem, ${clamp(note.posY, 4, 52)}%, calc(100% - 11rem))`,
                transform: `rotate(${note.rotation}deg)`,
              }}
            >
              <NoteInner note={note} userId={userId} compact />
            </article>
          ))}
          {place && (
            <div
              aria-hidden
              className={`note note-${color} pointer-events-none absolute z-20 w-[min(13.75rem,calc(100%-1rem))] p-3 text-sm opacity-70`}
              style={{
                left: `min(${place.x}%, calc(100% - 14.25rem))`,
                top: `min(${place.y}%, calc(100% - 8.5rem))`,
              }}
            >
              New note
            </div>
          )}
        </div>
      ) : (
        <ol className="mt-8 space-y-4">
          {visible.map((note) => (
            <li key={note.id}>
              <article className={`note note-${note.color} p-4`}>
                <NoteInner note={note} userId={userId} />
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function NoteInner({ note, userId, compact }: { note: Note; userId?: string; compact?: boolean }) {
  const agrees = note.reactions.filter((r) => r.type === "agree").length;
  const disagrees = note.reactions.filter((r) => r.type === "disagree").length;
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-medium">
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-white"
            style={{ background: `hsl(${note.user.avatarHue} 40% 32%)` }}
          >
            {initials(note.user.name)}
          </span>
          {note.user.name}
        </p>
        <time className="text-[11px] opacity-70">{formatRelative(note.createdAt)}</time>
      </div>
      <p className={`mt-2 leading-5 ${compact ? "line-clamp-5" : ""}`}>{note.body}</p>
      <div className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${compact ? "opacity-90" : ""}`}>
        <button type="button" onClick={() => reactToComment(note.id, "agree")} className="rounded-full bg-black/10 px-2 py-1">
          Agree {agrees}
        </button>
        <button type="button" onClick={() => reactToComment(note.id, "disagree")} className="rounded-full bg-black/10 px-2 py-1">
          Disagree {disagrees}
        </button>
        {userId && (
          <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-full bg-black/10 px-2 py-1">
            Reply
          </button>
        )}
        {userId && !compact && (
          <button type="button" onClick={() => reportComment(note.id)} className="rounded-full bg-black/10 px-2 py-1">
            Report
          </button>
        )}
      </div>
      {note.replies.length > 0 && (
        compact ? (
          <p className="mt-2 text-[11px] opacity-70">{note.replies.length} {note.replies.length === 1 ? "reply" : "replies"}</p>
        ) : (
          <ul className="mt-3 space-y-2 border-t border-black/10 pt-2">
            {note.replies.map((item) => (
              <li key={item.id} className="text-xs leading-5">
                <span className="font-medium">{item.user.name}: </span>
                {item.body}
              </li>
            ))}
          </ul>
        )
      )}
      {open && (
        <form
          className="mt-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await addCommentReply(note.id, reply);
            setReply("");
            setOpen(false);
          }}
        >
          <label className="visually-hidden" htmlFor={`reply-${note.id}`}>
            Reply
          </label>
          <input
            id={`reply-${note.id}`}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            className="w-full rounded-lg bg-white/50 px-2 py-1 text-xs"
          />
        </form>
      )}
    </div>
  );
}
