export const runtime = "nodejs"; // ensure Node runtime for Resend

import { NextResponse } from "next/server";
import { getRouteSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendInviteEmail } from "@/lib/email";
import { getClientBaseUrl } from "@/lib/baseUrl";

export async function POST(req: Request) {
  const sb = await getRouteSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(()=>({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sa = getSupabaseAdmin();
  const { data: invite } = await sa
    .from("org_invites")
    .select("id, email, role, token, org_id, invited_by")
    .eq("id", id).maybeSingle();
  if (!invite) return NextResponse.json({ error: "invite not found" }, { status: 404 });

  const { data: org } = await sa.from("organizations").select("name").eq("id", invite.org_id).single();
  const { data: inviter } = await sa.rpc("get_users_lite", { ids: [invite.invited_by] });

  const base = getClientBaseUrl();
  const acceptUrl = `${base}/accept-invite?token=${invite.token}`;

  await sendInviteEmail({
    to: invite.email,
    role: invite.role as "owner" | "admin" | "member",
    orgName: org?.name || "Vamoot org",
    acceptUrl,
    invitedBy: inviter?.[0] || null
  });

  return NextResponse.json({ ok: true });
}

