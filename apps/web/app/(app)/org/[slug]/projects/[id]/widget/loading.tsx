import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="rounded-3xl border p-4 bg-neutral-50">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

