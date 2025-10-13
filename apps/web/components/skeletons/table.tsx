import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-3xl border bg-white">
      <div className="p-3 border-b">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

