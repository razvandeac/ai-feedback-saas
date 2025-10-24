import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { v4 as uuid } from "uuid";

export async function getProjectWithWidget(projectId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminSupabase as any)
    .from("projects")
    .select(`
      id, name, org_id, key, allowed_origins, require_project_origins, widget_id,
      studio_widgets!projects_widget_id_fkey(id, widget_config, published_config, version, published_at)
    `)
    .eq("id", projectId)
    .single();
  if (error) throw error;
  if (!data) throw new Error("Project not found");
  
  const widget = (data as { studio_widgets?: { id: string; widget_config: unknown; published_config: unknown; version: number; published_at: string } | null }).studio_widgets || null;
  return { ...data, widget };
}

export async function ensureProjectWidget(projectId: string, orgId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // Check if project already has a widget
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: p } = await (adminSupabase as any).from("projects").select("widget_id").eq("id", projectId).single();
  if (p?.widget_id) return p.widget_id as string;

  const defaultConfig = {
    theme: { variant: "light", primaryColor: "#3b82f6", backgroundColor: "#ffffff", fontFamily: "Inter", borderRadius: 12 },
    blocks: [{ id: uuid(), type: "text", version: 1, data: { text: "Welcome! Edit this in Studio.", align: "left" } }],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: w, error: werr } = await (adminSupabase as any)
    .from("studio_widgets")
    .insert({ org_id: orgId, name: "Project Widget", widget_config: defaultConfig, published_config: defaultConfig })
    .select("id")
    .single();
  if (werr) throw werr;

  // Link widget to project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminSupabase as any).from("projects").update({ widget_id: w.id }).eq("id", projectId);
  
  return w.id as string;
}
