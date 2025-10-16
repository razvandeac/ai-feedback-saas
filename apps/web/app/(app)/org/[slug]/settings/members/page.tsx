export const revalidate = 0;
import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import InviteModal from "@/components/invites/invite-modal";
import InvitesTable from "@/components/invites/invites-table";
import { myOrgRole } from "@/lib/my-org-role";
import { displayName } from "@/lib/display-name";
import { notFound } from "next/navigation";
import { getClientBaseUrl } from "@/lib/baseUrl";

type UserLite = {
  id: string;
  email?: string | null;
  full_name?: string | null;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  invited_by: string;
};

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getServerSupabase();
  const role = await myOrgRole(slug);

  const { data: org } = await sb.from("organizations").select("id, slug, name").eq("slug", slug).single();
  if (!org) notFound();

  const { data: members } = await sb
    .from("org_members")
    .select("user_id, role, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  // Use admin client to fetch invites (RLS policies may reference users table)
  const admin = getSupabaseAdmin();
  const { data: invitesData, error: invitesError } = await admin
    .from("org_invites")
    .select("id, email, role, status, token, created_at, invited_by")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });
  
  const invites: Invite[] = invitesData || [];
  
  if (invitesError) {
    console.error("[members] Invites query error:", invitesError);
  }
  
  console.log("[members] Fetched", invites.length, "invites");

  // Fetch user data via RPC
  const userIds = (members ?? []).map(m => m.user_id);
  const inviterIds = Array.from(new Set(invites.map(i => i.invited_by).filter(Boolean)));
  const allUserIds: string[] = Array.from(new Set([...userIds, ...inviterIds]));
  
  console.log("[members] Fetching user data for:", { userIds: userIds.length, inviterIds: inviterIds.length, total: allUserIds.length });
  console.log("[members] User IDs:", allUserIds);
  
  let userMap = new Map<string, UserLite>();
  if (allUserIds.length > 0) {
    try {
      // Use admin client for RPC to avoid permission issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rpcResult = await admin.rpc("get_users_lite", { ids: allUserIds } as any);
      console.log("[members] RPC result:", rpcResult);
      
      const { data: usersLite, error: rpcError } = rpcResult as { data: UserLite[] | null; error: Error | null };
      if (rpcError) {
        console.error("[members] RPC error:", rpcError);
      } else if (usersLite) {
        console.log("[members] RPC returned", usersLite.length, "users:", usersLite);
        userMap = new Map((usersLite as UserLite[]).map((u) => [u.id, u]));
      } else {
        console.warn("[members] RPC returned null data");
      }
    } catch (error) {
      console.error("[members] RPC exception:", error);
    }
  }

  // Format members with user data
  const membersWithEmail = (members ?? []).map(m => ({
    ...m,
    user: userMap.get(m.user_id) || null
  }));

  console.log("[members] User map:", userMap);
  console.log("[members] Members with email:", membersWithEmail);

  // Add acceptUrl and inviter to invites
  const base = getClientBaseUrl();
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
          <p className="text-sm text-neutral-500">
            Invite teammates to this organization.{" "}
            <Link href={`/org/${org.slug}/members/help`} className="text-brand hover:underline">
              Need help?
            </Link>
          </p>
        </div>
        {(role === "owner" || role === "admin") && <InviteModal orgSlug={org.slug} />}
      </div>

      <div className="rounded-3xl border bg-white p-4">
        <div className="text-sm font-medium mb-2">Current members</div>
        <ul className="space-y-2">
          {membersWithEmail.map((m)=>(
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

