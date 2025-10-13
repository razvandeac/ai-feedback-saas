import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border bg-white p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-20 mt-1" />
        </div>
        <div className="rounded-3xl border bg-white p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-20 mt-1" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white">
          <div className="p-3 border-b">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}

