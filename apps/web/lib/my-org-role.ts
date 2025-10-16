import { getServerSupabase } from "@/lib/supabaseServer";

export async function myOrgRole(slug: string) {
  const sb = await getServerSupabase();
  const { data: org } = await sb.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: m } = await sb.from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single();
  return m?.role || null;
}

