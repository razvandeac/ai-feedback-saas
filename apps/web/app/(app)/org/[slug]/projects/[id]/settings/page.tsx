import { supabaseServer } from "@/lib/supabase-server";
import WidgetConfigForm from "@/components/projects/widget-config-form";

export const revalidate = 0;

export default async function ProjectSettingsPage({
  params
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params;
  const sb = await supabaseServer();
  
  const { data: project } = await sb
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .single();
  
  if (!project) return <div className="p-6">Project not found</div>;

  const { data: config } = await sb
    .from("widget_config")
    .select("settings")
    .eq("project_id", project.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">{project.name} Widget Settings</h1>
      <WidgetConfigForm projectId={project.id} initial={config?.settings ?? {}} />
    </div>
  );
}

