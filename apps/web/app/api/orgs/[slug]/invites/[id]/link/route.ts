export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getClientBaseUrl } from "@/lib/baseUrl";

async function requireOrgAdmin(sb: Awaited<ReturnType<typeof getRouteSupabase>>, slug: string) {
  const adminSupabase = getSupabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "unauthorized" };
  const { data: org } = await adminSupabase.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return { ok: false, status: 404, error: "org not found" };
  const { data: mem } = await (adminSupabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from("org_members")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!mem || !["owner", "admin"].includes(mem.role)) return { ok: false, status: 403, error: "forbidden" };
  return { ok: true, orgId: org.id };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const sb = await getRouteSupabase();
  const gate = await requireOrgAdmin(sb, slug);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sa = getSupabaseAdmin();
  const { data: invite, error } = await sa
    .from("org_invites")
    .select("id, token")
    .eq("id", id)
    .maybeSingle();
  if (error || !invite) return NextResponse.json({ error: "invite not found" }, { status: 404 });

  const base = getClientBaseUrl();
  const acceptUrl = `${base.replace(/\/$/, '')}/accept-invite?token=${invite.token}`;
  return NextResponse.json({ acceptUrl });
}

