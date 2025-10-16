import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Verify user is member of org that owns this project
  const { data: project } = await sb
    .from("projects")
    .select("id, org_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const { data: membership } = await sb
    .from("org_members")
    .select("role")
    .eq("org_id", project.org_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Fetch widget config (RLS policy allows members to read)
  const { data: config, error } = await sb
    .from("widget_config")
    .select("settings")
    .eq("project_id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  return NextResponse.json({ settings: config?.settings || {} });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { settings } = await req.json().catch(() => ({}));
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "settings object required" }, { status: 400 });
  }

  // Verify user is admin/owner of org that owns this project
  const { data: project } = await sb
    .from("projects")
    .select("id, org_id")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const { data: membership } = await sb
    .from("org_members")
    .select("role")
    .eq("org_id", project.org_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "forbidden - admin required" }, { status: 403 });
  }

  // Update or insert widget config (RLS policy allows admins to update)
  const { data, error } = await sb
    .from("widget_config")
    .upsert(
      { project_id: id, settings, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    )
    .select("settings, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

