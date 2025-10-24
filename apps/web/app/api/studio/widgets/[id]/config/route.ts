import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const adminSupabase = getSupabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { widget_config } = await req.json().catch(() => ({}));
  if (!widget_config || typeof widget_config !== "object") {
    return NextResponse.json({ error: "widget_config object required" }, { status: 400 });
  }

  // Verify user is member of org that owns this widget using admin client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: widget } = await (adminSupabase as any)
    .from("studio_widgets")
    .select("id, org_id")
    .eq("id", id)
    .single();

  if (!widget) return NextResponse.json({ error: "widget not found" }, { status: 404 });

  const { data: membership } = await (adminSupabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from("org_members")
    .select("role")
    .eq("org_id", widget.org_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Update widget config using admin client to bypass RLS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminSupabase as any)
    .from("studio_widgets")
    .update({
      widget_config: widget_config,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("widget_config, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
