import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import CreateOrgForm from "@/components/create-org-form";

export default async function OnboardingPage() {
  const sb = await getServerSupabase();
  const adminSupabase = getSupabaseAdmin();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // Use admin client to bypass RLS issues
  const { data: memberships } = await (adminSupabase as any).from("org_members") // eslint-disable-line @typescript-eslint/no-explicit-any
    .select("org_id, organizations(slug)")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    const org = memberships[0].organizations;
    if (org) redirect(`/org/${org.slug}`);
  }
  
  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create your organization</h1>
      <CreateOrgForm />
    </div>
  );
}

