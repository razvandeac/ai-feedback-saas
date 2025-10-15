import { supabaseServer } from "@/lib/supabase-server";

type EventRow = {
  id: string;
  type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

export default async function RecentEvents({ projectId }: { projectId: string }) {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("events")
    .select("id, type, created_at, payload")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(15);

  return (
    <div className="rounded-3xl border bg-white">
      <div className="p-3 border-b text-sm font-medium">Recent events</div>
      <ul className="divide-y">
        {(data as EventRow[] ?? []).map((e) => (
          <li key={e.id} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{e.type}</div>
              <div className="text-xs text-neutral-500">{new Date(e.created_at).toLocaleString()}</div>
            </div>
            {e.payload && <pre className="mt-1 text-[11px] text-neutral-600 overflow-x-auto">{JSON.stringify(e.payload, null, 2)}</pre>}
          </li>
        ))}
        {(!data || data.length === 0) && (
          <li className="p-6 text-sm text-neutral-500">No events yet.</li>
        )}
      </ul>
    </div>
  );
}

