import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { email, role } = await req.json().catch(() => ({}));
  if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });
  if (!["owner","admin","member"].includes(role)) return NextResponse.json({ error: "invalid role" }, { status: 400 });

  const { data: org, error: orgErr } = await sb.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (orgErr || !org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  // Verify user is admin/owner of this org
  const { data: membership } = await sb
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .single();
  
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "forbidden - admin required" }, { status: 403 });
  }

  // Use admin client to insert (bypasses all RLS/FK checks)
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("org_invites")
    .insert({ org_id: org.id, email, role, invited_by: user.id })
    .select("id, token, email, role, status, created_at")
    .single();

  if (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const acceptUrl = `${base}/accept-invite?token=${data.token}`;

  // Don't fetch inviter on create - GET endpoint will enrich later
  return NextResponse.json({ ...data, acceptUrl });
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: org } = await sb.from("organizations").select("id,slug").eq("slug", slug).single();
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const { data: invites, error } = await sb
    .from("org_invites")
    .select("id, email, role, status, created_at, invited_by, token")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const inviterIds = Array.from(new Set((invites ?? []).map(i => i.invited_by).filter(Boolean)));
  let usersById = new Map<string, any>();
  if (inviterIds.length) {
    const { data: usersLite, error: rpcErr } = await sb.rpc("get_users_lite", { ids: inviterIds });
    if (!rpcErr && usersLite) {
      usersById = new Map((usersLite as any[]).map((u: any) => [u.id, u]));
    }
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const enriched = (invites ?? []).map(i => ({
    ...i,
    inviter: usersById.get(i.invited_by) || null,
    acceptUrl: `${base}/accept-invite?token=${i.token}`,
  }));

  return NextResponse.json(enriched);
}
