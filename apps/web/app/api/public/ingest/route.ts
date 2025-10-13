import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return preflight(req, ["POST", "OPTIONS"]);
}

type Body = {
  key: string;
  type: string;
  widget_id?: string | null;
  payload?: Record<string, any>;
};

const MAX_PAYLOAD_BYTES = 8 * 1024; // 8KB cap

export async function POST(req: Request) {
  // CORS gate
  const gated = withCORS(new NextResponse(null, { status: 204 }), req, ["POST", "OPTIONS"]);
  if (!gated.headers.get("Access-Control-Allow-Origin")) {
    return forbidCORS(req);
  }

  const raw = await req.text(); // measure size
  if (raw.length > MAX_PAYLOAD_BYTES) {
    return withCORS(NextResponse.json({ error: "payload too large" }, { status: 413 }), req, ["POST", "OPTIONS"]);
  }

  let body: Body;
  try {
    body = JSON.parse(raw);
  } catch {
    return withCORS(NextResponse.json({ error: "invalid json" }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }

  const key = (body?.key || "").trim();
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(key)) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }
  const type = (body?.type || "").trim();
  if (!/^[-.\w/]{1,64}$/.test(type)) {
    return withCORS(NextResponse.json({ error: "invalid type" }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }

  const sb = supabaseAdmin();

  const { data: proj } = await sb
    .from("projects")
    .select("id, key")
    .eq("key", key)
    .maybeSingle();
  if (!proj) {
    return withCORS(NextResponse.json({ error: "invalid key" }, { status: 404 }), req, ["POST", "OPTIONS"]);
  }

  const userAgent = req.headers.get("user-agent") ?? null;
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || null;

  // Insert event
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  const { error: evErr } = await sb.from("events").insert({
    project_id: proj.id,
    widget_id: body.widget_id ?? null,
    type,
    payload,
    user_agent: userAgent,
    ip
  });
  if (evErr) {
    return withCORS(NextResponse.json({ error: evErr.message }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }

  // Mirror feedback
  if (type === "feedback.submit") {
    const ratingRaw = (payload as any)?.rating;
    const rating = typeof ratingRaw === "number" ? Math.max(1, Math.min(5, Math.round(ratingRaw))) : null;
    const commentRaw = (payload as any)?.comment;
    const comment = typeof commentRaw === "string" ? String(commentRaw).slice(0, 2000) : null;

    const { error: fbErr } = await sb.from("feedback").insert({
      project_id: proj.id,
      rating,
      comment
    });
    if (fbErr) {
      // log but don't fail ingest
      console.error("[public/ingest] feedback insert failed:", fbErr.message);
    }
  }

  return withCORS(NextResponse.json({ ok: true }), req, ["POST", "OPTIONS"]);
}

