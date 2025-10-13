import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: org, error: orgErr } = await sb.from("organizations").select("id").eq("slug", slug).single();
  if (orgErr || !org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  // Projects in this org
  const { data: projects } = await sb.from("projects").select("id,name").eq("org_id", org.id).order("created_at", { ascending: false });
  const pids = (projects ?? []).map(p => p.id);

  if (!pids.length) {
    return NextResponse.json({
      totals: { projects: 0, feedback: 0, events7d: 0, events30d: 0 },
      perProject: []
    });
  }

  // Counts
  const [{ count: feedbackCount }, { count: events7d }, { count: events30d }] = await Promise.all([
    sb.from("feedback").select("*", { count: "exact", head: true }).in("project_id", pids),
    sb.from("events").select("*", { count: "exact", head: true }).in("project_id", pids).gte("created_at", new Date(Date.now()-7*24*3600*1000).toISOString()),
    sb.from("events").select("*", { count: "exact", head: true }).in("project_id", pids).gte("created_at", new Date(Date.now()-30*24*3600*1000).toISOString()),
  ]);

  // Per project counts (feedback + events total)
  const { data: feedbackAgg } = await sb
    .from("feedback")
    .select("project_id")
    .in("project_id", pids);

  const { data: eventsAgg } = await sb
    .from("events")
    .select("project_id")
    .in("project_id", pids);

  // Manual aggregation since Supabase doesn't support group by in all plans
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

  return NextResponse.json({
    totals: {
      projects: pids.length,
      feedback: feedbackCount ?? 0,
      events7d: events7d ?? 0,
      events30d: events30d ?? 0
    },
    perProject
  });
}

