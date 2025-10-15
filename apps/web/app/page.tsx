import { getServerSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function Home() {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await sb
    .from("organizations")
    .select("slug, memberships!inner(user_id)")
    .limit(1)
    .maybeSingle();

  if (!org) redirect("/onboarding");
  redirect(`/org/${org.slug}`);
}
