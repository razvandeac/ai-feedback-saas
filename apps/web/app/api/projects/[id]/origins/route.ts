import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { cleanOrigins } from "@/lib/origin-validate";

async function requireAdmin(sb: any, projectId: string) {
  const { data: proj } = await sb.from("projects").select("org_id").eq("id", projectId).single();
  if (!proj) return { ok: false, status: 404, error: "project not found" };
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "unauthorized" };
  const { data: mem } = await sb.from("memberships").select("role").eq("org_id", proj.org_id).eq("user_id", user.id).maybeSingle();
  if (!mem || !["owner","admin"].includes(mem.role)) return { ok: false, status: 403, error: "forbidden" };
  return { ok: true };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { ok, status, error } = await requireAdmin(sb, id);
  if (!ok) return NextResponse.json({ error }, { status });
  const { data } = await sb.from("projects").select("allowed_origins").eq("id", id).single();
  return NextResponse.json({ allowed_origins: data?.allowed_origins ?? null });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { ok, status, error } = await requireAdmin(sb, id);
  if (!ok) return NextResponse.json({ error }, { status });

  const { allowed_origins } = await req.json().catch(()=>({}));
  if (allowed_origins !== null && !Array.isArray(allowed_origins)) {
    return NextResponse.json({ error: "allowed_origins must be array or null" }, { status: 400 });
  }
  const list = cleanOrigins(allowed_origins as string[] | null);

  const { error: updErr } = await sb.from("projects").update({ allowed_origins: list }).eq("id", id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
  return NextResponse.json({ ok: true, allowed_origins: list });
}

