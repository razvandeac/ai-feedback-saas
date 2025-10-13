import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

type Body = {
  key: string;             // project.key
  type: string;            // e.g. "feedback.submit"
  widget_id?: string | null;
  payload?: Record<string, any>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.key || !body?.type) {
      return cors(NextResponse.json({ error: "key and type are required" }, { status: 400 }));
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || null;
    
    /* Naive in-memory throttle could go here if running single instance.
       For multi-instance production, use Redis/KV store.
       Example: check if IP has submitted > N events in last M seconds.
       Skipping for now - rely on RLS and rate limiting at proxy level. */

    const sb = supabaseAdmin();

    // 1) Resolve project
    const { data: proj, error: pErr } = await sb
      .from("projects")
      .select("id, key, org_id")
      .eq("key", body.key)
      .single();
    if (pErr || !proj) return cors(NextResponse.json({ error: "invalid key" }, { status: 404 }));

    const userAgent = req.headers.get("user-agent") ?? null;

    // 2) Insert event
    const { error: evErr } = await sb.from("events").insert({
      project_id: proj.id,
      widget_id: body.widget_id ?? null,
      type: body.type,
      payload: body.payload ?? {},
      user_agent: userAgent,
      ip
    });
    if (evErr) return cors(NextResponse.json({ error: evErr.message }, { status: 400 }));

    // 3) Mirror feedback
    if (body.type === "feedback.submit") {
      const ratingRaw = body.payload?.rating;
      const rating =
        typeof ratingRaw === "number" ? Math.max(1, Math.min(5, Math.round(ratingRaw))) : null;
      const comment =
        typeof body.payload?.comment === "string"
          ? body.payload.comment.slice(0, 2000)
          : null;

      const { error: fbErr } = await sb.from("feedback").insert({
        project_id: proj.id,
        rating,
        comment
      });
      if (fbErr) {
        // Don't fail overall; log in server
        console.error("[public/ingest] feedback insert failed:", fbErr.message);
      }
    }

    return cors(NextResponse.json({ ok: true }));
  } catch (e: any) {
    return cors(NextResponse.json({ error: e?.message ?? "ingest failed" }, { status: 500 }));
  }
}

