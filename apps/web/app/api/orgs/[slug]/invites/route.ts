export const runtime = "nodejs"; // ensure Node runtime for Resend

import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendInviteEmail } from "@/lib/email";
import { getClientBaseUrl } from "@/lib/baseUrl";

type UserLite = {
  id: string;
  email?: string | null;
  full_name?: string | null;
};

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getRouteSupabase();
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

  const base = getClientBaseUrl();
  const acceptUrl = `${base}/accept-invite?token=${data.token}`;

  // Fetch inviter info for email
  let inviterInfo = null;
  try {
    const { data: usersLite } = await admin.rpc("get_users_lite", { ids: [user.id] });
    if (usersLite && usersLite.length) {
      inviterInfo = { name: usersLite[0].full_name, email: usersLite[0].email };
    }
  } catch (e) {
    console.error("Failed to fetch inviter info:", e);
  }

  // Send email (async, don't wait)
  sendInviteEmail({
    to: email,
    orgName: org.name,
    role: role as "owner" | "admin" | "member",
    acceptUrl,
    invitedBy: inviterInfo
  }).catch(err => {
    console.error("[invite] Email send failed:", err);
    // Don't fail the request if email fails
  });

  return NextResponse.json({ ...data, acceptUrl });
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getRouteSupabase();
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
  let usersById = new Map<string, UserLite>();
  if (inviterIds.length) {
    const { data: usersLite, error: rpcErr } = await sb.rpc("get_users_lite", { ids: inviterIds });
    if (!rpcErr && usersLite) {
      usersById = new Map((usersLite as UserLite[]).map((u) => [u.id, u]));
    }
  }

  const base = getClientBaseUrl();
  const enriched = (invites ?? []).map(i => ({
    ...i,
    inviter: usersById.get(i.invited_by) || null,
    acceptUrl: `${base}/accept-invite?token=${i.token}`,
  }));

  return NextResponse.json(enriched);
}
