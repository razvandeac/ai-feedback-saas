import { getServerSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import CreateOrgForm from "@/components/create-org-form";

export default async function OnboardingPage() {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await sb
    .from("organizations")
    .select("slug, memberships!inner(user_id)")
    .limit(1)
    .maybeSingle();

  if (org) redirect(`/org/${org.slug}`);
  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create your organization</h1>
      <CreateOrgForm />
    </div>
  );
}

