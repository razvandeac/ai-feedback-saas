import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/../lib/supabaseClient";
import { hmacHex, safeEqualHex } from "@/lib/hmac";

type Payload = { project_id: string; text: string; metadata?: Record<string, unknown> };

export async function POST(req: NextRequest) {
  const secret = process.env.HMAC_SECRET || "";
  const devBypass = process.env.NODE_ENV !== "production";

  const raw = await req.text();
  const sig = req.headers.get("x-signature");

  if (!sig) {
    if (!devBypass) return NextResponse.json({ error: "missing signature" }, { status: 401 });
  } else {
    if (!secret) return NextResponse.json({ error: "server not configured" }, { status: 500 });
    const expected = hmacHex(raw, secret);
    if (!safeEqualHex(sig, expected)) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: Payload;
  try { payload = JSON.parse(raw); } 
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  const { project_id, text, metadata = {} } = payload;
  if (!project_id || !text) return NextResponse.json({ error: "project_id and text required" }, { status: 400 });

  const { error } = await supabase.from("feedback").insert({ project_id, text, metadata });
  if (error) return NextResponse.json({ error: "db insert failed" }, { status: 500 });

  return NextResponse.json({ status: "ok" });
}
