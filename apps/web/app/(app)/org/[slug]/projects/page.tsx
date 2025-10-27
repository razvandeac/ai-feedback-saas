export const revalidate = 0; // always fresh - clean build
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ProjectsClient from "@/components/projects/projects-client";
import { myOrgRole } from "@/lib/my-org-role";
import { notFound } from "next/navigation";

export default async function ProjectsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adminSupabase = getSupabaseAdmin();
  
  // Use admin client to bypass RLS issues
  const { data: org } = await adminSupabase.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: projects }, role] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminSupabase as any)
      .from("projects")
      .select("id, name, key, created_at, widget_id, studio_widgets!projects_widget_id_fkey(id, widget_config, published_config)")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false }),
    myOrgRole(slug)
  ]);

  const canManage = role === "owner" || role === "admin";

  return <ProjectsClient initial={projects ?? []} orgSlug={org.slug ?? ''} canManage={canManage} />;
}