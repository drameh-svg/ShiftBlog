"use client";

import { useEffect, useState } from "react";

export function SplashIntro() {
  const [step, setStep] = useState<"spin" | "title" | "exit" | "hidden">("spin");
  const [turns, setTurns] = useState(0);

  useEffect(() => {
    const start = window.requestAnimationFrame(() => setTurns(2));
    const titleTimer = window.setTimeout(() => setStep("title"), 1900);
    const exitTimer = window.setTimeout(() => setStep("exit"), 3200);
    const hideTimer = window.setTimeout(() => setStep("hidden"), 3900);
    return () => {
      window.cancelAnimationFrame(start);
      window.clearTimeout(titleTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (step === "hidden") return null;

  return (
    <div
      className={`splash-overlay ${step === "exit" ? "splash-overlay-exit" : ""}`}
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
          style={{ transform: `rotate(${turns * 360}deg) scale(1)` }}
        />
        <p className={`splash-title ${step === "spin" ? "" : "splash-title-visible"}`}>
          <span className="splash-title-shift">SHIFT</span>
          <span className="splash-title-kicker">Public Policy Blog</span>
        </p>
      </div>
    </div>
  );
}
