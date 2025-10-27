import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { version, orgId } = await req.json();
  const adminSupabase = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error: vErr } = await (adminSupabase as any)
    .from("studio_widget_versions")
    .select("config, org_id")
    .eq("widget_id", params.id)
    .eq("version", version)
    .single();
    
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 400 });
  if (row.org_id !== orgId) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  // Update the draft config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: up } = await (adminSupabase as any)
    .from("studio_widgets")
    .update({ widget_config: row.config })
    .eq("id", params.id);
    
  if (up) return NextResponse.json({ error: up.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
