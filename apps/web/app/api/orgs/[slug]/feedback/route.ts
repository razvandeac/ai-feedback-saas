import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const project = url.searchParams.get("project") || undefined;
  const ratingParam = url.searchParams.get("rating") || undefined; // "1".."5" or "null"
  const q = url.searchParams.get("q") || undefined;
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10)));
  const fromRow = (page - 1) * pageSize;
  const toRow = fromRow + pageSize - 1;

  // Resolve org
  const { data: org, error: orgErr } = await sb
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();
  if (orgErr || !org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  // resolve project ids for org (RLS-safe)
  const projectQuery = sb.from("projects").select("id").eq("org_id", org.id);
  const { data: projRows } = await projectQuery;
  const projectIds = (projRows ?? []).map(p => p.id);

  let query = sb
    .from("feedback")
    .select("id, project_id, rating, comment, created_at", { count: "exact" })
    .in("project_id", projectIds);

  if (project) query = query.eq("project_id", project);
  if (ratingParam === "null") query = query.is("rating", null);
  if (ratingParam && ratingParam !== "null") query = query.eq("rating", Number(ratingParam));
  if (from) query = query.gte("created_at", new Date(from).toISOString());
  if (to) query = query.lte("created_at", new Date(to).toISOString());
  if (q) query = query.ilike("comment", `%${q}%`);

  query = query.order("created_at", { ascending: false }).range(fromRow, toRow);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  });
}

