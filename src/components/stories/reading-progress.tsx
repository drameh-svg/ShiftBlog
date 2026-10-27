"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(height > 0 ? Math.min(100, (scrolled / height) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="progress" style={{ width: `${width}%` }} role="progressbar" aria-label="Reading progress" aria-valuenow={Math.round(width)} aria-valuemin={0} aria-valuemax={100} />;
}
