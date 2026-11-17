export function Atmosphere({ className = "" }: { className?: string }) {
  return (
    <div className={`atmosphere ${className}`} aria-hidden>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  );
}
