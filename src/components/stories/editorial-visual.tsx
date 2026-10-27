const THEMES: Record<string, { from: string; to: string; pattern: "grid" | "orbs" | "type" | "scan" | "data" }> = {
  aurora: { from: "#4a2ad4", to: "#b6ff3c", pattern: "orbs" },
  grid: { from: "#1a1430", to: "#7c5cff", pattern: "grid" },
  liquid: { from: "#5b2ad1", to: "#8dff4a", pattern: "orbs" },
  data: { from: "#10182c", to: "#6ee7ff", pattern: "data" },
  glass: { from: "#2a1848", to: "#d8b4ff", pattern: "orbs" },
  scan: { from: "#0d1210", to: "#c8ff4a", pattern: "scan" },
  orb: { from: "#3b1d8f", to: "#ff8ad4", pattern: "orbs" },
  type: { from: "#160f28", to: "#f4f1ea", pattern: "type" },
};

export function EditorialVisual({
  theme = "aurora",
  title,
  className = "",
}: {
  theme?: string;
  title?: string;
  className?: string;
}) {
  const visual = THEMES[theme] ?? THEMES.aurora;
  const id = theme.replace(/[^a-z]/g, "") + "grad";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={visual.from} />
            <stop offset="100%" stopColor={visual.to} />
          </linearGradient>
          <filter id={`${id}blur`}>
            <feGaussianBlur stdDeviation="38" />
          </filter>
        </defs>
        <rect width="800" height="500" fill={`url(#${id})`} opacity="0.9" />
        {visual.pattern === "orbs" && (
          <g filter={`url(#${id}blur)`} opacity="0.85">
            <circle cx="220" cy="160" r="170" fill={visual.to} />
            <circle cx="600" cy="340" r="200" fill={visual.from} />
            <circle cx="430" cy="80" r="90" fill="#ffffff" opacity="0.35" />
          </g>
        )}
        {visual.pattern === "grid" && (
          <g opacity="0.28" stroke="#fff" strokeWidth="1">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50 + 40} y2="500" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50 + 20} />
            ))}
          </g>
        )}
        {visual.pattern === "scan" && (
          <g opacity="0.35">
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x="0" y={i * 28} width="800" height="8" fill="#c8ff4a" opacity={0.08 + (i % 4) * 0.05} />
            ))}
            <circle cx="560" cy="170" r="70" fill="none" stroke="#c8ff4a" strokeWidth="2" />
            <circle cx="560" cy="170" r="12" fill="#c8ff4a" />
          </g>
        )}
        {visual.pattern === "data" && (
          <g fill="#9ad8ff" opacity="0.55">
            {Array.from({ length: 28 }).map((_, i) => (
              <rect
                key={i}
                x={40 + (i % 14) * 52}
                y={420 - ((i * 37) % 280)}
                width="18"
                height={(i * 37) % 280}
                rx="4"
              />
            ))}
          </g>
        )}
        {visual.pattern === "type" && (
          <text
            x="40"
            y="300"
            fill="#fff"
            opacity="0.22"
            fontSize="92"
            fontFamily="var(--font-sans)"
            letterSpacing="-4"
          >
            SHIFT
          </text>
        )}
      </svg>
      {title && (
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="max-w-md text-sm text-white/80">{title}</p>
        </div>
      )}
    </div>
  );
}
