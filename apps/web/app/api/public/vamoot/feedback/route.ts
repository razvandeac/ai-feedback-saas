export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { withCORS, preflight, forbidCORS } from "@/lib/cors";

const MAX_BYTES = 8 * 1024;

export async function OPTIONS(req: Request) {
  // Global env allow-list is fine here (platform-wide feedback)
  return preflight(req, ["POST", "OPTIONS"], null);
}

export async function POST(req: Request) {
  // CORS gate first
  const gated = withCORS(new NextResponse(null, { status: 204 }), req, ["POST", "OPTIONS"], null);
  if (!gated.headers.get("Access-Control-Allow-Origin")) return forbidCORS();

  const raw = await req.text();
  if (raw.length > MAX_BYTES) {
    return withCORS(NextResponse.json({ error: "payload too large" }, { status: 413 }), req, ["POST", "OPTIONS"]);
  }

  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { 
    return withCORS(NextResponse.json({ error: "invalid json" }, { status: 400 }), req, ["POST", "OPTIONS"]); 
  }

  const source = (body.source ?? "app").toString().slice(0, 32);
  const ratingRaw = body.rating;
  const rating = typeof ratingRaw === "number" ? Math.max(1, Math.min(5, Math.round(ratingRaw))) : null;
  const comment = typeof body.comment === "string" ? body.comment.slice(0, 2000) : null;
  const email   = typeof body.email === "string" ? body.email.slice(0, 255) : null;
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : null;

  if (!comment && !rating) {
    return withCORS(NextResponse.json({ error: "missing feedback content" }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }

  const sa = supabaseAdmin();
  const { error } = await sa.from("platform_feedback").insert({
    source, rating, comment, email, metadata
  });
  if (error) {
    return withCORS(NextResponse.json({ error: error.message }, { status: 400 }), req, ["POST", "OPTIONS"]);
  }

  return withCORS(NextResponse.json({ ok: true }), req, ["POST", "OPTIONS"]);
}

