import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

export async function OPTIONS(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // We can prefetch project allow-list for OPTIONS too
  const { key } = await params;
  const sb = getSupabaseAdmin();
  const cleanKey = (key || "").trim();
  let extra: string[] | null = null;
  let projectOnly = false;
  if (cleanKey) {
    const { data: proj } = await sb
      .from("projects")
      .select("allowed_origins, require_project_origins")
      .eq("key", cleanKey)
      .maybeSingle();
    extra = (proj?.allowed_origins as string[] | null) || null;
    projectOnly = !!(proj?.require_project_origins);
  }
  return preflight(req, ["GET", "OPTIONS"], extra, { projectOnly });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sb = getSupabaseAdmin();
  const cleanKey = (key || "").trim();

  // Validate key early
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(cleanKey)) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 400 }), req, ["GET", "OPTIONS"]);
  }

  // Fetch project (and allowed origins + flag)
  const { data: proj } = await sb
    .from("projects")
    .select("id, name, key, allowed_origins, require_project_origins")
    .eq("key", cleanKey)
    .maybeSingle();

  const extra = (proj?.allowed_origins as string[] | null) || null;
  const projectOnly = !!(proj?.require_project_origins);

  // CORS gate after we know per-project list
  const gated = withCORS(new NextResponse(null, { status: 204 }), req, ["GET", "OPTIONS"], extra, { projectOnly });
  if (!gated.headers.get("Access-Control-Allow-Origin")) return forbidCORS();

  if (!proj) {
    return withCORS(NextResponse.json({ error: "project not found" }, { status: 404 }), req, ["GET", "OPTIONS"], extra, { projectOnly });
  }

  const { data: cfg } = await sb
    .from("widget_config")
    .select("settings")
    .eq("project_id", proj.id)
    .maybeSingle();

  const payload = {
    project: { id: proj.id, name: proj.name },
    settings: {
      theme: "light",
      primaryColor: "#2563eb",
      showRating: true,
      showComment: true,
      title: "We value your feedback!",
      ...(cfg?.settings as Record<string, unknown> || {})
    }
  };

  return withCORS(NextResponse.json(payload), req, ["GET", "OPTIONS"], extra, { projectOnly });
}

