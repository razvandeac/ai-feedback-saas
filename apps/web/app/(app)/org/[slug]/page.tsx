import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Sparkline from "@/components/sparkline";

async function getEventSeries(sb: Awaited<ReturnType<typeof supabaseServer>>, orgId: string) {
  // Simple server-side bucketing: last 14 days events across org projects
  // (We do it approximately in SQL; refine later in analytics)
  const { data: projects } = await sb.from("projects").select("id").eq("org_id", orgId);
  const pids = (projects ?? []).map(p => p.id);
  if (pids.length === 0) return [];

  const { data: rows } = await sb
    .from("events")
    .select("created_at")
    .in("project_id", pids)
    .gte("created_at", new Date(Date.now() - 14*24*3600*1000).toISOString());

  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
    buckets.set(d.toISOString().slice(0,10), 0);
  }
  (rows ?? []).forEach(r => {
    const key = new Date(r.created_at).toISOString().slice(0,10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });
  return Array.from(buckets.entries()).map(([date,count])=>({ date, count }));
}

export default async function OrgHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("*").eq("slug", slug).single();
  if (!org) notFound();

  const [{ count: feedbackCount }, { count: eventsCount }, { count: widgetCount }, series] = await Promise.all([
    sb.from("feedback").select("*", { count: "exact", head: true }),
    sb.from("events").select("*", { count: "exact", head: true }),
    sb.from("widgets").select("*", { count: "exact", head: true }),
    getEventSeries(sb, org.id)
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <p className="text-sm text-neutral-500">Overview of activity in your organization.</p>
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
          <div className="text-sm font-medium">Events (last 14 days)</div>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <Sparkline data={series} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
