import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const adminSupabase = getSupabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Verify user is member of org that owns this project using admin client
  const { data: project } = await adminSupabase
    .from("projects")
    .select("id, org_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const { data: membership } = await (adminSupabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from("org_members")
    .select("role")
    .eq("org_id", project.org_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Fetch widget config using admin client to bypass RLS
  const { data: config, error } = await adminSupabase
    .from("widget_config")
    .select("widget_config")
    .eq("project_id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  return NextResponse.json({ settings: config?.widget_config || {} });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const adminSupabase = getSupabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { settings } = await req.json().catch(() => ({}));
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "settings object required" }, { status: 400 });
  }

  // Verify user is admin/owner of org that owns this project using admin client
  const { data: project } = await adminSupabase
    .from("projects")
    .select("id, org_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const { data: membership } = await (adminSupabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from("org_members")
    .select("role")
    .eq("org_id", project.org_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "forbidden - admin required" }, { status: 403 });
  }

  // Update or insert widget config using admin client to bypass RLS
  const { data, error } = await adminSupabase
    .from("widget_config")
    .upsert(
      { project_id: id, widget_config: settings, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    )
    .select("widget_config, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

