export const revalidate = 0; // always fresh
import { supabaseServer } from "@/lib/supabase-server";
import ProjectsClient from "@/components/projects/projects-client";
import { notFound } from "next/navigation";

export default async function ProjectsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("id,slug,name").eq("slug", slug).single();
  if (!org) notFound();

  const { data: projects } = await sb
    .from("projects")
    .select("id, name, key, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return <ProjectsClient initial={projects ?? []} orgSlug={org.slug} />;
}
