import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Use admin client to fetch invite (bypasses RLS)
  const admin = supabaseAdmin();
  const { data: inv } = await admin.from("org_invites").select("id, org_id, status").eq("id", id).single();
  if (!inv) return NextResponse.json({ error: "invite not found" }, { status: 404 });

  // Verify user is admin/owner of this org
  const { data: membership } = await sb
    .from("memberships")
    .select("role")
    .eq("org_id", inv.org_id)
    .eq("user_id", user.id)
    .single();
  
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "forbidden - admin required" }, { status: 403 });
  }

  // Revoke the invite using admin client
  const { error } = await admin.from("org_invites").update({ status: "revoked" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  return NextResponse.json({ ok: true });
}

