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
  if (error) return <div style={{color:"crimson"}}>Error: {error.message}</div>;
  if (!data.length) return <div>No feedback yet. Submit one via <a href="/submit">/submit</a>.</div>;
  return (
    <div style={{display:"grid",gap:12}}>
      <h2>Inbox (latest 20)</h2>
      {data.map(r => (
        <Card key={r.id}>
          <CardTitle>{new Date(r.created_at).toLocaleString()}</CardTitle>
          <div>{r.text}</div>
          <pre style={{marginTop:8,background:"#fafafa",padding:8}}>
            {JSON.stringify(r.metadata, null, 2)}
          </pre>
        </Card>
      ))}
    </div>
  );
}
