import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  // For preflight we don't have the key; fall back to env list only
  return preflight(req, ["POST", "OPTIONS"], null, { projectOnly: false });
}

type Body = { key: string; type: string; widget_id?: string | null; payload?: Record<string, unknown>; };
const MAX_PAYLOAD_BYTES = 8 * 1024;

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_PAYLOAD_BYTES) {
    return withCORS(NextResponse.json({ error: "payload too large" }, { status: 413 }), req, ["POST", "OPTIONS"]);
  }

  let body: Body;
  try { body = JSON.parse(raw); } catch { 
    return withCORS(NextResponse.json({ error: "invalid json" }, { status: 400 }), req, ["POST", "OPTIONS"]); 
  }

  const key = (body?.key || "").trim();
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(key)) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }

  const sb = getSupabaseAdmin();
  const { data: proj } = await sb
    .from("projects")
    .select("id, key, allowed_origins, require_project_origins")
    .eq("key", key)
    .maybeSingle();

  const extra = (proj?.allowed_origins as string[] | null) || null;
  const projectOnly = !!(proj?.require_project_origins);

  // CORS gate with per-project list
  const gated = withCORS(new NextResponse(null, { status: 204 }), req, ["POST", "OPTIONS"], extra, { projectOnly });
  if (!gated.headers.get("Access-Control-Allow-Origin")) return forbidCORS();

  if (!proj) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 404 }), req, ["POST", "OPTIONS"], extra, { projectOnly });
  }

  const userAgent = req.headers.get("user-agent") ?? null;
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || null;

  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  const { error: evErr } = await sb.from("events").insert({
    project_id: proj.id,
    widget_id: body.widget_id ?? null,
    type: body.type,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: payload as any,
    user_agent: userAgent,
    ip
  });
  if (evErr) {
    return withCORS(NextResponse.json({ error: evErr.message }, { status: 400 }), req, ["POST", "OPTIONS"], extra, { projectOnly });
  }

  if (body.type === "feedback.submit") {
    const payloadData = payload as Record<string, unknown> | undefined;
    const ratingRaw = payloadData?.rating;
    const rating = typeof ratingRaw === "number" ? Math.max(1, Math.min(5, Math.round(ratingRaw))) : null;
    const commentRaw = payloadData?.comment;
    const comment = typeof commentRaw === "string" ? String(commentRaw).slice(0, 2000) : null;
    await sb.from("feedback").insert({ project_id: proj.id, rating, comment });
  }

  return withCORS(NextResponse.json({ ok: true }), req, ["POST", "OPTIONS"], extra, { projectOnly });
}

