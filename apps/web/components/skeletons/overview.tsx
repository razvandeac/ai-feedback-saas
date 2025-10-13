import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
      <div className="card-grid">
        <div className="rounded-3xl border bg-white p-5">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
      <div className="rounded-3xl border bg-white p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-24 w-full mt-3" />
      </div>
    </div>
  );
}

