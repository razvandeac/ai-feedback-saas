import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function getProjectWithWidget(projectId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  const { data, error } = await adminSupabase
    .from("projects")
    .select("id, name, key, created_at, org_id")
    .eq("id", projectId)
    .single();
    
  if (error) throw error;
  if (!data) throw new Error("Project not found");
  
  // For now, return project without widget info since tables don't exist yet
  // TODO: Add studio_widgets join back after migration is applied
  return { ...data, widget: null };
}

export async function ensureProjectWidget(projectId: string, orgId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // For now, always create a new widget since widget_id column doesn't exist yet
  // TODO: Add widget_id check back after migration is applied
  
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: w, error: werr } = await (adminSupabase as any)
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

  // TODO: Link widget to project after migration is applied
  // await adminSupabase
  //   .from("projects")
  //   .update({ widget_id: w.id })
  //   .eq("id", projectId);
    
  return w.id as string;
}
