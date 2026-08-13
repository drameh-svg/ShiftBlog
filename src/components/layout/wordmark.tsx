import Link from "next/link";

export function Wordmark({
  href = "/",
  stacked = false,
  light = false,
}: {
  href?: string;
  stacked?: boolean;
  light?: boolean;
}) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="SHIFT Public Policy home">
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg bg-purple text-[11px] font-semibold tracking-tight text-white shadow-[0_0_24px_rgba(123,92,252,0.45)] ${light ? "bg-white text-purple-deep" : ""}`}
        aria-hidden
      >
        S
      </span>
      <span className={stacked ? "flex flex-col leading-none" : "flex items-baseline gap-2 leading-none"}>
        <span className="text-[15px] font-semibold tracking-[-0.04em]">SHIFT</span>
        <span className={`text-[11px] uppercase tracking-[0.18em] text-muted ${stacked ? "mt-1" : ""}`}>
          Public Policy
        </span>
      </span>
    </Link>
  );
}
