export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  // Use admin client to find invite (bypasses RLS)
  const admin = getSupabaseAdmin();
  const { data: invite, error: invErr } = await admin
    .from("org_invites")
    .select("id, org_id, email, role, status")
    .eq("token", token)
    .single();
  if (invErr || !invite) return NextResponse.json({ error: "invalid token" }, { status: 404 });
  if (invite.status !== "pending") return NextResponse.json({ error: "invite not pending" }, { status: 400 });

  // email must match logged-in user
  if (!user?.email || user.email.toLowerCase() !== (invite.email as string).toLowerCase()) {
    return NextResponse.json({ error: "email mismatch" }, { status: 403 });
  }

  // upsert membership
  const { error: memErr } = await sb.from("org_members").upsert({
    org_id: invite.org_id, user_id: user.id, role: invite.role as "owner" | "admin" | "member"
  }, { onConflict: "org_id,user_id" });

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 400 });

  // mark accepted using admin client
  const { error: updErr } = await admin
    .from("org_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, org_id: invite.org_id });
}

