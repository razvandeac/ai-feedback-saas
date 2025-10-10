import { supabase } from "../../lib/supabaseClient";
import { Card, CardTitle } from "../../components/ui/Card";

export const dynamic = "force-dynamic";

async function load() {
  const { data, error } = await supabase
    .from("feedback")
    .select("id,text,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  return { data: data ?? [], error };
}

export default async function InboxPage() {
  const { data, error } = await load();
  if (error) return <div className="text-red-600">Error: {error.message}</div>;
  if (!data.length) return <p className="muted">No feedback yet. Try <a className="link" href="/submit">/submit</a>.</p>;
  return (
    <div className="grid gap-4 md:gap-6">
      <h2 className="text-xl md:text-2xl font-semibold">Inbox (latest 20)</h2>
      {data.map(r => (
        <Card key={r.id}>
          <CardTitle>{new Date(r.created_at).toLocaleString()}</CardTitle>
          <div className="text-[15px]">{r.text}</div>
          <pre className="mt-3 rounded-lg border border-cardBorder bg-bg p-3 text-xs text-textMuted overflow-x-auto">
            {JSON.stringify(r.metadata, null, 2)}
          </pre>
        </Card>
      ))}
    </div>
  );
}
