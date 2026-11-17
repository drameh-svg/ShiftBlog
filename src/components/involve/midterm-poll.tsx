"use client";

import { useMemo, useState } from "react";
import { castPollVote } from "@/app/actions/polls";

export type PollChoice = {
  id: string;
  label: string;
  votes: number;
};

export function MidtermPoll({
  pollId,
  question,
  options,
  selectedOptionId,
}: {
  pollId: string;
  question: string;
  options: PollChoice[];
  selectedOptionId: string | null;
}) {
  const [choiceId, setChoiceId] = useState(selectedOptionId);
  const [counts, setCounts] = useState(() => Object.fromEntries(options.map((option) => [option.id, option.votes])));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const total = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  async function vote(optionId: string) {
    if (pending || optionId === choiceId) return;
    const previous = choiceId;
    setError(null);
    setPending(true);
    setChoiceId(optionId);
    setCounts((current) => {
      const next = { ...current };
      if (previous) next[previous] = Math.max(0, (next[previous] ?? 0) - 1);
      next[optionId] = (next[optionId] ?? 0) + 1;
      return next;
    });
    try {
      const result = await castPollVote(pollId, optionId);
      if (result?.error) {
        setChoiceId(previous);
        setCounts(Object.fromEntries(options.map((option) => [option.id, option.votes])));
        setError(result.error);
      }
    } catch {
      setChoiceId(previous);
      setCounts(Object.fromEntries(options.map((option) => [option.id, option.votes])));
      setError("Could not save your vote. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[1.8rem] border border-line bg-bg-elevated/60 p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.18em] text-lime">2026 midterms</p>
      <h2 className="display mt-3 text-3xl sm:text-4xl">{question}</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        One vote, no account required. Results update as students answer.
      </p>
      <div className="mt-8 space-y-3">
        {options.map((option) => {
          const votes = counts[option.id] ?? 0;
          const percent = total === 0 ? 0 : Math.round((votes / total) * 100);
          const selected = choiceId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={pending}
              onClick={() => vote(option.id)}
              className={`relative w-full overflow-hidden rounded-[1.2rem] border px-4 py-4 text-left transition ${
                selected ? "border-lime bg-lime/10" : "border-line hover:border-purple/50"
              }`}
            >
              <span
                className={`absolute inset-y-0 left-0 ${selected ? "bg-lime/20" : "bg-purple/10"}`}
                style={{ width: `${percent}%` }}
                aria-hidden
              />
              <span className="relative flex items-center justify-between gap-4">
                <span className="text-base">{option.label}</span>
                <span className="text-sm text-muted">
                  {total === 0 && !choiceId ? "Vote" : `${percent}% · ${votes}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      {choiceId && (
        <p className="mt-4 text-sm text-muted">
          You voted. You can change your answer.
        </p>
      )}
    </section>
  );
}
