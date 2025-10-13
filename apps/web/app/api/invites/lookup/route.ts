import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function maskEmail(email?: string | null) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  const u = user.length <= 2 ? user[0] + "*" : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
  return `${u}@${domain}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    if (!token || !/^[0-9a-fA-F-]{36}$/.test(token)) {
      return NextResponse.json({ error: "invalid token" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Find invite by token (service role bypasses RLS, but we return minimal fields only)
    const { data: invite, error: invErr } = await sb
      .from("org_invites")
      .select("id, org_id, email, role, status, invited_by, created_at")
      .eq("token", token)
      .single();

    if (invErr || !invite) {
      return NextResponse.json({ error: "invite not found" }, { status: 404 });
    }

    // Fetch org meta
    const { data: org } = await sb
      .from("organizations")
      .select("id, name, slug")
      .eq("id", invite.org_id)
      .single();

    // Fetch inviter via RPC
    let inviter: any = null;
    const { data: usersLite } = await sb.rpc("get_users_lite", { ids: [invite.invited_by] });
    if (usersLite && usersLite.length) inviter = usersLite[0];

    return NextResponse.json({
      org: org ? { name: org.name, slug: org.slug } : null,
      inviter: inviter ? { full_name: inviter.full_name, email: inviter.email } : null,
      invite: {
        role: invite.role,
        status: invite.status,
        created_at: invite.created_at,
        email_hint: maskEmail(invite.email)
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "lookup failed" }, { status: 500 });
  }
}


