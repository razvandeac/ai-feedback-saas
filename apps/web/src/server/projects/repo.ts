import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { v4 as uuid } from "uuid";

export async function getProjectWithWidget(projectId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  try {
    // First get the project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project, error: projectError } = await (adminSupabase as any)
      .from("projects")
      .select("id, name, org_id, key, allowed_origins, require_project_origins, widget_id")
      .eq("id", projectId)
      .single();
    
    if (projectError) {
      console.error("Error fetching project:", projectError);
      throw projectError;
    }
    if (!project) throw new Error("Project not found");
    
    // If no widget_id, return project without widget
    if (!project.widget_id) {
      return { ...project, widget: null };
    }
    
    // Get the widget separately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: widget, error: widgetError } = await (adminSupabase as any)
      .from("studio_widgets")
      .select("id, widget_config, published_config, version, published_at")
      .eq("id", project.widget_id)
      .single();
    
    if (widgetError) {
      console.error("Error fetching widget:", widgetError);
      // If widget doesn't exist, return project without widget
      return { ...project, widget: null };
    }
    
    return { ...project, widget };
  } catch (error) {
    console.error("getProjectWithWidget error:", error);
    throw error;
  }
}

export async function ensureProjectWidget(projectId: string, orgId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  try {
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
    
    if (werr) {
      console.error("Error creating widget:", werr);
      throw werr;
    }

    // Link widget to project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uerr } = await (adminSupabase as any).from("projects").update({ widget_id: w.id }).eq("id", projectId);
    if (uerr) {
      console.error("Error linking widget to project:", uerr);
      throw uerr;
    }
    
    return w.id as string;
  } catch (error) {
    console.error("ensureProjectWidget error:", error);
    throw error;
  }
}
