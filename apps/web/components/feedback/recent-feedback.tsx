export const dynamic = "force-dynamic";
import { supabaseServer } from "@/lib/supabase-server";

export default async function RecentFeedback({ projectIds }: { projectIds: string[] }) {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("feedback")
    .select("id, project_id, rating, comment, created_at")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="rounded-3xl border bg-white">
      <div className="p-3 border-b text-sm font-medium">Recent feedback</div>
      <ul className="divide-y">
        {(data ?? []).map((f:any) => (
          <li key={f.id} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{f.rating ? `★ ${f.rating}` : "—"}</div>
              <div className="text-xs text-neutral-500">{new Date(f.created_at).toLocaleString()}</div>
            </div>
            {f.comment && <p className="mt-1 text-neutral-700 line-clamp-2">{f.comment}</p>}
          </li>
        ))}
        {(!data || data.length === 0) && (
          <li className="p-6 text-sm text-neutral-500">No feedback yet.</li>
        )}
      </ul>
    </div>
  );
}

