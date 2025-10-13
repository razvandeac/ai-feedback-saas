import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Sparkline from "@/components/sparkline";
import SeriesChart from "@/components/analytics/series-chart";
import { displayName } from "@/lib/display-name";

async function getAnalyticsSeries(sb: Awaited<ReturnType<typeof supabaseServer>>, orgId: string) {
  const { data: projects } = await sb.from("projects").select("id").eq("org_id", orgId);
  const pids = (projects ?? []).map(p => p.id);
  if (pids.length === 0) return [];

  const windowDays = 14;
  const since = new Date(); 
  since.setHours(0,0,0,0); 
  since.setDate(since.getDate() - (windowDays - 1));

  const [{ data: evs }, { data: fbs }] = await Promise.all([
    sb.from("events").select("created_at").in("project_id", pids).gte("created_at", since.toISOString()),
    sb.from("feedback").select("created_at").in("project_id", pids).gte("created_at", since.toISOString()),
  ]);

  const bucket = new Map<string, { date: string; events: number; feedback: number }>();
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(since); d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0,10);
    bucket.set(key, { date: key, events: 0, feedback: 0 });
  }
  (evs ?? []).forEach(r => {
    const key = new Date(r.created_at).toISOString().slice(0,10);
    const row = bucket.get(key); if (row) row.events++;
  });
  (fbs ?? []).forEach(r => {
    const key = new Date(r.created_at).toISOString().slice(0,10);
    const row = bucket.get(key); if (row) row.feedback++;
  });

  return Array.from(bucket.values());
}

async function getOverviewStats(sb: Awaited<ReturnType<typeof supabaseServer>>, orgId: string) {
  const { data: projects } = await sb.from("projects").select("id,name").eq("org_id", orgId);
  const pids = (projects ?? []).map(p => p.id);
  
  if (!pids.length) {
    return {
      totals: { projects: 0, feedback: 0, events7d: 0, events30d: 0 },
      perProject: []
    };
  }

  const [{ count: feedbackCount }, { count: events7d }, { count: events30d }] = await Promise.all([
    sb.from("feedback").select("*", { count: "exact", head: true }).in("project_id", pids),
    sb.from("events").select("*", { count: "exact", head: true }).in("project_id", pids).gte("created_at", new Date(Date.now()-7*24*3600*1000).toISOString()),
    sb.from("events").select("*", { count: "exact", head: true }).in("project_id", pids).gte("created_at", new Date(Date.now()-30*24*3600*1000).toISOString()),
  ]);

  const [{ data: feedbackAgg }, { data: eventsAgg }] = await Promise.all([
    sb.from("feedback").select("project_id").in("project_id", pids),
    sb.from("events").select("project_id").in("project_id", pids),
  ]);

  const fbMap = new Map<string, number>();
  (feedbackAgg ?? []).forEach((r: any) => {
    fbMap.set(r.project_id, (fbMap.get(r.project_id) ?? 0) + 1);
  });

  const evMap = new Map<string, number>();
  (eventsAgg ?? []).forEach((r: any) => {
    evMap.set(r.project_id, (evMap.get(r.project_id) ?? 0) + 1);
  });

  const perProject = (projects ?? []).map(p => ({
    id: p.id,
    name: p.name,
    feedback: fbMap.get(p.id) ?? 0,
    events: evMap.get(p.id) ?? 0
  }));

  return {
    totals: {
      projects: pids.length,
      feedback: feedbackCount ?? 0,
      events7d: events7d ?? 0,
      events30d: events30d ?? 0
    },
    perProject
  };
}

export default async function OrgHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("*").eq("slug", slug).single();
  if (!org) notFound();

  // Fetch owner via RPC
  let owner: any = null;
  if ((org as any).created_by) {
    const { data: usersLite } = await sb.rpc("get_users_lite", { ids: [(org as any).created_by] });
    if (usersLite && usersLite.length) owner = usersLite[0];
  }

  const [{ count: feedbackCount }, { count: eventsCount }, { count: widgetCount }, series, overview] = await Promise.all([
    sb.from("feedback").select("*", { count: "exact", head: true }),
    sb.from("events").select("*", { count: "exact", head: true }),
    sb.from("widgets").select("*", { count: "exact", head: true }),
    getAnalyticsSeries(sb, org.id),
    getOverviewStats(sb, org.id)
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <p className="text-sm text-neutral-500">
          Overview of activity in your organization.{" "}
          <a href={`/org/${slug}/projects`} className="text-brand hover:text-brand-hover underline">
            Manage projects
          </a>
        </p>
        {owner && (
          <p className="text-sm text-neutral-500 mt-1">
            Owner: {displayName(owner)}
          </p>
        )}
      </div>

      <div className="card-grid">
        <Card>
          <CardHeader>
            <div className="kpi">{feedbackCount ?? 0}</div>
            <div className="kpi-label">Feedback items</div>
          </CardHeader>
          <CardContent>Recent submissions across projects.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="kpi">{eventsCount ?? 0}</div>
            <div className="kpi-label">Events captured</div>
          </CardHeader>
          <CardContent>All ingest events tracked by the widget.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="kpi">{widgetCount ?? 0}</div>
            <div className="kpi-label">Active widgets</div>
          </CardHeader>
          <CardContent>Embeds currently live.</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Events & Feedback (last 14 days)</div>
        </CardHeader>
        <CardContent>
          <SeriesChart data={series} />
          <div className="mt-3 text-sm text-neutral-600">
            Projects: {overview?.totals?.projects ?? 0} • Feedback: {overview?.totals?.feedback ?? 0} • Events (7d): {overview?.totals?.events7d ?? 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Per-project totals</div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(overview?.perProject ?? []).map((p: any) => (
              <div key={p.id} className="rounded-2xl border p-4">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-neutral-600 mt-1">Feedback: {p.feedback} • Events: {p.events}</div>
              </div>
            ))}
            {(!overview?.perProject || overview.perProject.length === 0) && (
              <div className="text-sm text-neutral-500">No projects yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
