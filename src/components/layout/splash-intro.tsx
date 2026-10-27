"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "shift-splash-seen";

export function SplashIntro() {
  const [phase, setPhase] = useState<"play" | "exit" | "hidden">("play");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hidden");
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setPhase("hidden");
        return;
      }
    } catch {
      // sessionStorage can be blocked; still play the intro.
    }

    const exitTimer = window.setTimeout(() => setPhase("exit"), 2800);
    const hideTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("hidden");
    }, 3400);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`splash-overlay ${phase === "exit" ? "splash-overlay-exit" : ""}`}
      role="presentation"
      aria-hidden
    >
      <div className="splash-stage">
        <img
          src="/shift-logo.png"
          alt=""
          width={128}
          height={128}
          className="splash-logo"
        />
        <p className="splash-title">public policy blog</p>
      </div>
    </div>
  );
}
