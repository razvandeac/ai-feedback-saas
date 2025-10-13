export const revalidate = 0;
import { supabaseServer } from "@/lib/supabase-server";

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString();
}

export default async function OrgOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();

  const { data: org } = await sb.from("organizations").select("id, name, slug").eq("slug", slug).single();
  if (!org) return <div className="p-6">Org not found</div>;

  // projects in this org
  const { data: projects } = await sb.from("projects").select("id, name").eq("org_id", org.id);
  const ids = (projects ?? []).map(p => p.id);
  if (ids.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-lg font-semibold">{org.name}</h1>
        <div className="rounded-3xl border bg-white p-6 text-sm text-neutral-600">
          No projects yet. Create one to start collecting feedback.
        </div>
      </div>
    );
  }

  const since = new Date(Date.now() - 7*24*60*60*1000).toISOString();

  // counts
  const [{ count: fbTotal }, { count: fb7 }] = await Promise.all([
    sb.from("feedback").select("*", { count: "exact", head: true }).in("project_id", ids),
    sb.from("feedback").select("*", { count: "exact", head: true }).in("project_id", ids).gte("created_at", since),
  ]);

  // avg rating (avoid aggregate permission issues with a small query)
  const { data: ratings } = await sb
    .from("feedback")
    .select("rating")
    .in("project_id", ids)
    .not("rating", "is", null)
    .order("created_at", { ascending: false })
    .limit(500); // sample recent 500 to keep it cheap

  const avg = ratings && ratings.length ? (ratings.reduce((a, r:any)=>a + (r.rating ?? 0), 0) / ratings.length) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{org.name}</h1>
        <p className="text-sm text-neutral-500">Overview</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-xs text-neutral-500">Total feedback</div>
          <div className="mt-1 text-2xl font-semibold">{fmt(fbTotal)}</div>
        </div>
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-xs text-neutral-500">Last 7 days</div>
          <div className="mt-1 text-2xl font-semibold">{fmt(fb7)}</div>
        </div>
        <div className="rounded-3xl border bg-white p-4">
          <div className="text-xs text-neutral-500">Avg rating</div>
          <div className="mt-1 text-2xl font-semibold">{avg ? avg.toFixed(2) : "—"}</div>
        </div>
      </div>
    </div>
  );
}
