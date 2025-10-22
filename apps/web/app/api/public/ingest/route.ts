import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Helper function for public API responses with proper CORS headers
function createPublicResponse(data: unknown, status: number = 200) {
  const response = NextResponse.json(data, { status });
  
  // Add CORS headers for public API
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Vary", "Origin");
  
  return response;
}

export async function OPTIONS() {
  // For public API, always allow OPTIONS requests
  return createPublicResponse(null, 204);
}

type Body = { key: string; type: string; widget_id?: string | null; payload?: Record<string, unknown>; };
const MAX_PAYLOAD_BYTES = 8 * 1024;

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_PAYLOAD_BYTES) {
    return createPublicResponse({ error: "payload too large" }, 413);
  }

  let body: Body;
  try { body = JSON.parse(raw); } catch { 
    return createPublicResponse({ error: "invalid json" }, 400); 
  }

  const key = (body?.key || "").trim();
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(key)) {
    return createPublicResponse({ error: "invalid key" }, 400);
  }

  const sb = getSupabaseAdmin();
  const { data: proj } = await sb
    .from("projects")
    .select("id, key, allowed_origins, require_project_origins")
    .eq("key", key)
    .maybeSingle();

  const extra = (proj?.allowed_origins as string[] | null) || null;
  const projectOnly = !!(proj?.require_project_origins);

  // Simple CORS check for public API
  const origin = req.headers.get("origin");
  const allowRequest = !origin || !projectOnly || (extra && extra.includes(origin));

  if (!allowRequest) {
    return createPublicResponse({ error: "origin not allowed" }, 403);
  }

  if (!proj) {
    return createPublicResponse({ error: "invalid key" }, 404);
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
    return createPublicResponse({ error: evErr.message }, 400);
  }

  if (body.type === "feedback.submit") {
    const payloadData = payload as Record<string, unknown> | undefined;
    const ratingRaw = payloadData?.rating;
    const rating = typeof ratingRaw === "number" ? Math.max(1, Math.min(5, Math.round(ratingRaw))) : null;
    const commentRaw = payloadData?.comment;
    const comment = typeof commentRaw === "string" ? String(commentRaw).slice(0, 2000) : null;
    
    const { error: feedbackError } = await sb.from("feedback").insert({ project_id: proj.id, rating, comment });
    if (feedbackError) {
      console.error("Feedback insertion error:", feedbackError);
      return createPublicResponse({ error: `Feedback error: ${feedbackError.message}` }, 400);
    }
  }

  return createPublicResponse({ ok: true });
}

