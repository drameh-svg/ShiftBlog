"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getTheme() {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");

  function apply(next: "light" | "dark") {
    const root = document.documentElement;
    root.classList.add("theme-animating");
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.dataset.theme = next;
    root.style.colorScheme = next;
    localStorage.setItem("shift-theme", next);
    document.cookie = `shift-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.setTimeout(() => root.classList.remove("theme-animating"), 450);
  }

  return (
    <button
      type="button"
      onClick={() => apply(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elevated/40 text-fg transition hover:border-purple/50 hover:text-purple"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M17.5 14.2A7.2 7.2 0 0 1 9.8 6.5 6.5 6.5 0 1 0 17.5 14.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
