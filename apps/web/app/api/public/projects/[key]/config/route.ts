import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

export async function OPTIONS(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // We can prefetch project allow-list for OPTIONS too
  const { key } = await params;
  const sb = supabaseAdmin();
  const cleanKey = (key || "").trim();
  let extra: string[] | null = null;
  if (cleanKey) {
    const { data: proj } = await sb
      .from("projects")
      .select("allowed_origins")
      .eq("key", cleanKey)
      .maybeSingle();
    extra = (proj?.allowed_origins as string[] | null) || null;
  }
  return preflight(req, ["GET", "OPTIONS"], extra);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const sb = supabaseAdmin();
  const cleanKey = (key || "").trim();

  // Validate key early
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(cleanKey)) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 400 }), req, ["GET", "OPTIONS"]);
  }

  // Fetch project (and allowed origins)
  const { data: proj } = await sb
    .from("projects")
    .select("id, name, key, allowed_origins")
    .eq("key", cleanKey)
    .maybeSingle();

  const extra = (proj?.allowed_origins as string[] | null) || null;

  // CORS gate after we know per-project list
  const gated = withCORS(new NextResponse(null, { status: 204 }), req, ["GET", "OPTIONS"], extra);
  if (!gated.headers.get("Access-Control-Allow-Origin")) return forbidCORS(req);

  if (!proj) {
    return withCORS(NextResponse.json({ error: "project not found" }, { status: 404 }), req, ["GET", "OPTIONS"], extra);
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
      ...(cfg?.settings || {})
    }
  };

  return withCORS(NextResponse.json(payload), req, ["GET", "OPTIONS"], extra);
}

