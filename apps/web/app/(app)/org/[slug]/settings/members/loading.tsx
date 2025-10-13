import TableSkeleton from "@/components/skeletons/table";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-neutral-200 rounded-2xl animate-pulse" />
      <TableSkeleton rows={5} />
      <TableSkeleton rows={5} />
    </div>
  );
}

