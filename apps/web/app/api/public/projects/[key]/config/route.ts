import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return preflight(req, ["GET", "OPTIONS"]);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // CORS gate
  const gated = withCORS(new NextResponse(null, { status: 204 }), req, ["GET", "OPTIONS"]);
  if (!gated.headers.get("Access-Control-Allow-Origin")) {
    return forbidCORS(req);
  }

  const { key } = await params;
  const sb = supabaseAdmin();
  
  const cleanKey = (key || "").trim();
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(cleanKey)) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 400 }), req, ["GET", "OPTIONS"]);
  }

  const { data: proj } = await sb
    .from("projects")
    .select("id, name, key")
    .eq("key", cleanKey)
    .maybeSingle();

  if (!proj) {
    return withCORS(NextResponse.json({ error: "project not found" }, { status: 404 }), req, ["GET", "OPTIONS"]);
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

  return withCORS(NextResponse.json(payload), req, ["GET", "OPTIONS"]);
}

