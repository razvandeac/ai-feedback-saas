export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-neutral-200/60 ${className || ""}`} />;
}

