import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { publishWidget } from "@/app/actions/widget";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const adminSupabase = getSupabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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

  // Publish the widget
  const result = await publishWidget(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, version: result.version });
}
