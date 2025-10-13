export default function EmptyState({
  title,
  description,
  action
}: { title: string; description?: string; action?: React.ReactNode; }) {
  return (
    <div className="border border-dashed rounded-3xl p-8 text-center bg-white">
      <div className="text-lg font-medium">{title}</div>
      {description ? <div className="text-sm text-neutral-500 mt-1">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

