export const revalidate = 0;
import { supabaseServer } from "@/lib/supabase-server";
import InviteModal from "@/components/invites/invite-modal";
import InvitesTable from "@/components/invites/invites-table";
import { myOrgRole } from "@/lib/my-org-role";
import { displayName } from "@/lib/display-name";
import { notFound } from "next/navigation";

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const role = await myOrgRole(slug);

  const { data: org } = await sb.from("organizations").select("id, slug, name").eq("slug", slug).single();
  if (!org) notFound();

  const { data: members } = await sb
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const { data: invites } = await sb
    .from("org_invites")
    .select("id, email, role, status, token, created_at, invited_by")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  // Fetch user data via RPC
  const userIds = (members ?? []).map(m => m.user_id);
  const inviterIds = Array.from(new Set((invites ?? []).map(i => i.invited_by).filter(Boolean)));
  const allUserIds = Array.from(new Set([...userIds, ...inviterIds]));
  
  let userMap = new Map<string, any>();
  if (allUserIds.length > 0) {
    const { data: usersLite, error: rpcError } = await sb.rpc("get_users_lite", { ids: allUserIds });
    if (rpcError) {
      console.error("RPC error:", rpcError);
    } else if (usersLite) {
      userMap = new Map((usersLite as any[]).map((u: any) => [u.id, u]));
    }
  }

  // Format members with user data
  const membersWithEmail = (members ?? []).map(m => ({
    ...m,
    user: userMap.get(m.user_id) || null
  }));

  // Add acceptUrl and inviter to invites
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const invitesWithUrl = (invites ?? []).map(inv => ({
    ...inv,
    inviter: userMap.get(inv.invited_by) || null,
    acceptUrl: inv.token ? `${base}/accept-invite?token=${inv.token}` : undefined
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Members</h1>
          <p className="text-sm text-neutral-500">Invite teammates to this organization.</p>
        </div>
        {(role === "owner" || role === "admin") && <InviteModal orgSlug={org.slug} />}
      </div>

      <div className="rounded-3xl border bg-white p-4">
        <div className="text-sm font-medium mb-2">Current members</div>
        <ul className="space-y-2">
          {membersWithEmail.map((m: any)=>(
            <li key={m.user_id} className="flex items-center justify-between border rounded-2xl px-3 py-2">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{displayName(m.user)}</span>
                {m.user?.full_name && m.user?.email && <span className="text-xs text-neutral-500">{m.user.email}</span>}
              </div>
              <div className="text-sm text-neutral-600 capitalize">{m.role}</div>
            </li>
          ))}
          {membersWithEmail.length === 0 && <div className="text-sm text-neutral-500">No members yet.</div>}
        </ul>
      </div>

      <InvitesTable initial={invitesWithUrl} orgSlug={org.slug} />
    </div>
  );
}

