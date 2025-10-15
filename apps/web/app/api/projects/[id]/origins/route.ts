import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { cleanOrigins, isValidOriginEntry } from "@/lib/origin-validate";

async function requireAdmin(sb: Awaited<ReturnType<typeof getRouteSupabase>>, projectId: string) {
  const { data: proj } = await sb.from("projects").select("org_id").eq("id", projectId).single();
  if (!proj) return { ok: false, status: 404, error: "project not found" };
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "unauthorized" };
  const { data: mem } = await sb.from("memberships")
    .select("role")
    .eq("org_id", proj.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!mem || !["owner","admin"].includes(mem.role)) return { ok: false, status: 403, error: "forbidden" };
  return { ok: true };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const { ok, status, error } = await requireAdmin(sb, id);
  if (!ok) return NextResponse.json({ error }, { status });
  const { data } = await sb.from("projects")
    .select("allowed_origins, require_project_origins")
    .eq("id", id)
    .single();
  return NextResponse.json({
    allowed_origins: data?.allowed_origins ?? null,
    require_project_origins: !!data?.require_project_origins
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await getRouteSupabase();
  const { ok, status, error } = await requireAdmin(sb, id);
  if (!ok) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => ({}));
  const requireOnly = !!body.require_project_origins;
  const list = Array.isArray(body.allowed_origins) ? body.allowed_origins as string[] : null;

  // Validate entries server-side
  if (list) {
    for (const line of list) {
      if (!isValidOriginEntry(line)) {
        return NextResponse.json({ error: `invalid origin: ${line}` }, { status: 400 });
      }
    }
  }

  const cleaned = cleanOrigins(list);
  const { error: updErr } = await sb.from("projects")
    .update({ allowed_origins: cleaned, require_project_origins: requireOnly })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
  return NextResponse.json({ ok: true, allowed_origins: cleaned, require_project_origins: requireOnly });
}

