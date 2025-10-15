import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json("unauthorized", { status: 401 });

  const url = new URL(req.url);
  const project = url.searchParams.get("project") || undefined;
  const ratingParam = url.searchParams.get("rating") || undefined; // "1".."5" or "null"
  const q = url.searchParams.get("q") || undefined;
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;

  const { data: org } = await sb.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return NextResponse.json("org not found", { status: 404 });

  const { data: projs } = await sb.from("projects").select("id,name").eq("org_id", org.id);
  const pids = (projs ?? []).map(p => p.id);
  let query = sb.from("feedback").select("id, project_id, rating, comment, created_at").in("project_id", pids);

  if (project) query = query.eq("project_id", project);
  if (ratingParam === "null") query = query.is("rating", null);
  if (ratingParam && ratingParam !== "null") query = query.eq("rating", Number(ratingParam));
  if (from) query = query.gte("created_at", new Date(from).toISOString());
  if (to) query = query.lte("created_at", new Date(to).toISOString());
  if (q) query = query.ilike("comment", `%${q}%`);
  query = query.order("created_at", { ascending: false }).limit(5000);

  const { data, error } = await query;
  if (error) return NextResponse.json(error.message, { status: 400 });

  // CSV
  const mapName = new Map((projs ?? []).map(p => [p.id, p.name]));
  const header = ["id","project_name","rating","comment","created_at"];
  const rows = [header.join(",")];
  (data ?? []).forEach(r => {
    const fields = [
      r.id,
      (mapName.get(r.project_id) ?? ""),
      r.rating == null ? "" : String(r.rating),
      (r.comment ?? "").replace(/"/g,'""'),
      new Date(r.created_at).toISOString()
    ];
    rows.push([
      fields[0],
      `"${fields[1]}"`,
      fields[2],
      `"${fields[3]}"`,
      fields[4]
    ].join(","));
  });

  const csv = rows.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="feedback-${slug}.csv"`
    }
  });
}
