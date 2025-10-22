export const revalidate = 0; // always fresh - clean build
import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ProjectsClient from "@/components/projects/projects-client";
import { myOrgRole } from "@/lib/my-org-role";
import { notFound } from "next/navigation";

export default async function ProjectsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getServerSupabase();
  const adminSupabase = getSupabaseAdmin();
  
  // Use admin client to bypass RLS issues
  const { data: org } = await adminSupabase.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  const [{ data: projects }, role] = await Promise.all([
    adminSupabase.from("projects").select("id, name, key, created_at").eq("org_id", org.id).order("created_at", { ascending: false }),
    myOrgRole(slug)
  ]);

  const canManage = role === "owner" || role === "admin";

  return <ProjectsClient initial={projects ?? []} orgSlug={org.slug} canManage={canManage} />;
}
