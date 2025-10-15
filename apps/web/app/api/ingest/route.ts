import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type IngestBody = {
  project_id: string; // UUID
  widget_id?: string; // UUID
  type: string;       // e.g. "feedback.submit"
  payload?: Record<string, unknown>;      // JSON
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IngestBody;

    if (!body?.project_id || !body?.type) {
      return NextResponse.json({ error: "project_id and type are required" }, { status: 400 });
    }

    const sb = supabaseAdmin;

    const { error } = await sb.from("events").insert({
      project_id: body.project_id,
      widget_id: body.widget_id ?? null,
      type: body.type,
      payload: body.payload ?? {},
      user_agent: req.headers.get("user-agent") ?? undefined,
      ip: (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || null
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

