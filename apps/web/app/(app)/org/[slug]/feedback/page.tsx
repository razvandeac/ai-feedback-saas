import { supabaseServer } from "@/lib/supabase-server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import EmptyState from "@/components/empty-state";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

export default async function FeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  const { data: projects } = await sb.from("projects").select("id").eq("org_id", org.id);
  const pids = (projects ?? []).map(p => p.id);

  if (!pids.length) {
    return <EmptyState title="No projects yet" description="Create a project to start receiving feedback." />;
  }

  const { data: rows } = await sb
    .from("feedback")
    .select("id, project_id, rating, comment, created_at")
    .in("project_id", pids)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!rows || rows.length === 0) {
    return <EmptyState title="No feedback yet" description="Embed the widget to start collecting user feedback." />;
  }

  const chip = (r?: number | null) => {
    const base = "inline-block text-xs px-2 py-0.5 rounded-full";
    if (r == null) return <span className={`${base} bg-neutral-100 text-neutral-600`}>No rating</span>;
    if (r >= 4) return <span className={`${base} bg-green-100 text-green-700`}>{r} / 5</span>;
    if (r >= 3) return <span className={`${base} bg-yellow-100 text-yellow-700`}>{r} / 5</span>;
    return <span className={`${base} bg-red-100 text-red-700`}>{r} / 5</span>;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Feedback</h1>
      <div className="rounded-3xl border bg-white">
        <Table>
          <THead>
            <TR>
              <TH>Rating</TH>
              <TH>Comment</TH>
              <TH>Received</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map(r => (
              <TR key={r.id}>
                <TD className="w-[120px]">{chip(r.rating)}</TD>
                <TD className="max-w-[700px] truncate">{r.comment ?? <span className="text-neutral-400">—</span>}</TD>
                <TD className="text-neutral-600">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
