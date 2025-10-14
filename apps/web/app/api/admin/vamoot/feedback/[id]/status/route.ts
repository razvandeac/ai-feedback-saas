export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { isPlatformAdmin } from "@/lib/is-platform-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = await isPlatformAdmin();
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const formData = await req.formData();
  const status = String(formData.get("status") || "");
  if (!["new","triaged","closed"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const sb = await supabaseServer();
  const { error } = await sb.from("platform_feedback").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Redirect back to /admin
  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}

