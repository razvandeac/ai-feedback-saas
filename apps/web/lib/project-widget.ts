import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function getProjectWithWidget(projectId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  const { data, error } = await adminSupabase
    .from("projects")
    .select(`
      id, name, key, created_at, org_id, widget_id,
      studio_widgets!projects_widget_id_fkey(id, widget_config, published_config, version, published_at)
    `)
    .eq("id", projectId)
    .single();
    
  if (error) throw error;
  
  const widget = (data as { studio_widgets?: { id: string; widget_config: unknown; published_config: unknown; version: number; published_at: string } | null }).studio_widgets || null;
  return { ...data, widget };
}

export async function ensureProjectWidget(projectId: string, orgId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  const { data: p } = await adminSupabase
    .from("projects")
    .select("widget_id")
    .eq("id", projectId)
    .single();
    
  if (p?.widget_id) return p.widget_id as string;

  // Create a default widget config
  const defaultConfig = {
    theme: { 
      variant: "light", 
      primaryColor: "#3b82f6", 
      backgroundColor: "#ffffff", 
      fontFamily: "Inter", 
      borderRadius: 12 
    },
    blocks: [{ 
      id: crypto.randomUUID(), 
      type: "text", 
      version: 1, 
      data: { text: "Welcome! Edit this in Studio.", align: "left" } 
    }],
  };

  const { data: w, error: werr } = await adminSupabase
    .from("studio_widgets")
    .insert({ 
      org_id: orgId,
      name: "Project Widget",
      widget_config: defaultConfig, 
      published_config: defaultConfig 
    })
    .select("id")
    .single();
    
  if (werr) throw werr;

  await adminSupabase
    .from("projects")
    .update({ widget_id: w.id })
    .eq("id", projectId);
    
  return w.id as string;
}
