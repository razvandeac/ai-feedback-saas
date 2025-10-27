import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function listVersions(widgetId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminSupabase as any)
    .from("studio_widget_versions")
    .select("id, version, created_at")
    .eq("widget_id", widgetId)
    .order("version", { ascending: false })
    .limit(10);
    
  if (error) throw error;
  return data ?? [];
}

export async function getVersion(widgetId: string, version: number) {
  const adminSupabase = getSupabaseAdmin();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminSupabase as any)
    .from("studio_widget_versions")
    .select("config")
    .eq("widget_id", widgetId)
    .eq("version", version)
    .single();
    
  if (error) throw error;
  return data?.config;
}
