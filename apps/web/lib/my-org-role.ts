import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function myOrgRole(slug: string) {
  const sb = await getServerSupabase();
  const adminSupabase = getSupabaseAdmin();
  
  // Use admin client to bypass RLS issues
  const { data: org } = await adminSupabase.from("organizations").select("id").eq("slug", slug).single();
  if (!org) return null;
  
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  
  const { data: m } = await (adminSupabase as any).from("org_members").select("role").eq("org_id", org.id).eq("user_id", user.id).single(); // eslint-disable-line @typescript-eslint/no-explicit-any
  return m?.role || null;
}

