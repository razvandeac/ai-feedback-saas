import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const windowDays = Math.min(60, Math.max(7, Number(url.searchParams.get("window") || 14)));
  const projectId = url.searchParams.get("project") || undefined;

  const { data: org } = await sb.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const projQuery = sb.from("projects").select("id").eq("org_id", org.id);
  const { data: pRows } = await projQuery;
  const pids = (pRows ?? []).map(p => p.id);
  if (!pids.length) return NextResponse.json({ series: [] });

  const filterIds = projectId ? [projectId] : pids;
  const since = new Date(); since.setHours(0,0,0,0); since.setDate(since.getDate() - (windowDays - 1));

  const [{ data: evs }, { data: fbs }] = await Promise.all([
    sb.from("events").select("created_at").in("project_id", filterIds).gte("created_at", since.toISOString()),
    sb.from("feedback").select("created_at").in("project_id", filterIds).gte("created_at", since.toISOString()),
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

  return NextResponse.json({ series: Array.from(bucket.values()) });
}

