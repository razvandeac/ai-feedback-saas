export const revalidate = 0; // always fresh - clean build
import { getServerSupabase } from "@/lib/supabaseServer";
import ProjectsClient from "@/components/projects/projects-client";
import { myOrgRole } from "@/lib/my-org-role";
import { notFound } from "next/navigation";

export default async function ProjectsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await getServerSupabase();
  const { data: org } = await sb.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  const [{ data: projects }, role] = await Promise.all([
    sb.from("projects").select("id, name, key, created_at").eq("org_id", org.id).order("created_at", { ascending: false }),
    myOrgRole(slug)
  ]);

  const canManage = role === "owner" || role === "admin";

  return <ProjectsClient initial={projects ?? []} orgSlug={org.slug} canManage={canManage} />;
}
