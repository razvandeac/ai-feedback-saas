import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";

export default async function Home() {
  const sb = await getServerSupabase();
  const adminSupabase = getSupabaseAdmin();
  
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // Use admin client to bypass RLS recursion issues
  const { data: memberships } = await (adminSupabase as any).from("org_members") // eslint-disable-line @typescript-eslint/no-explicit-any
    .select("org_id, organizations(slug)")
    .eq("user_id", user.id)
    .limit(1);

  if (!memberships || memberships.length === 0) redirect("/onboarding");
  
  const org = memberships[0].organizations;
  if (!org) redirect("/onboarding");
  
  redirect(`/org/${org.slug}`);
}
