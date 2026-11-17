"use client";

import { useState } from "react";
import { saveStoryAction } from "@/app/actions/auth";

export function ArticleRail({
  title,
  slug,
  storyId,
  saved,
  signedIn,
}: {
  title: string;
  slug: string;
  storyId: string;
  saved: boolean;
  signedIn: boolean;
}) {
  const [isSaved, setSaved] = useState(saved);
  const share = async () => {
    const url = `${window.location.origin}/stories/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <aside className="pointer-events-none fixed top-1/3 right-4 z-30 hidden flex-col gap-2 lg:flex">
      <div className="pointer-events-auto glass flex flex-col gap-2 rounded-full p-2">
        <button type="button" onClick={share} className="grid h-10 w-10 place-items-center rounded-full text-sm hover:text-lime" aria-label="Share story">
          ↗
        </button>
        {signedIn && (
          <button
            type="button"
            onClick={async () => {
              const result = await saveStoryAction(storyId);
              if (result && "saved" in result) setSaved(Boolean(result.saved));
            }}
            className={`grid h-10 w-10 place-items-center rounded-full text-sm ${isSaved ? "text-lime" : ""}`}
            aria-label={isSaved ? "Unsave story" : "Save story"}
          >
            {isSaved ? "★" : "☆"}
          </button>
        )}
        <a href="#discussion" className="grid h-10 w-10 place-items-center rounded-full text-sm hover:text-purple" aria-label="Jump to discussion">
          ⌘
        </a>
      </div>
    </aside>
  );
}
