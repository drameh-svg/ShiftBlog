import Image from "next/image";
import Link from "next/link";

export function Wordmark({
  href = "/",
  stacked = false,
}: {
  href?: string;
  stacked?: boolean;
  light?: boolean;
}) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="SHIFT Public Policy home">
      <Image
        src="/shift-logo.png"
        alt="SHIFT Public Policy"
        width={36}
        height={36}
        className="h-9 w-9 rounded-full"
        priority
      />
      <span className={stacked ? "flex flex-col leading-none" : "flex items-baseline gap-2 leading-none"}>
        <span className="text-[15px] font-semibold tracking-[-0.04em]">SHIFT</span>
        <span className={`text-[11px] uppercase tracking-[0.18em] text-muted ${stacked ? "mt-1" : ""}`}>
          Public Policy
        </span>
      </span>
    </Link>
  );
}
