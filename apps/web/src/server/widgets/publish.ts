import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function publishWidget(widgetId: string, orgId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: w, error: rerr } = await (adminSupabase as any)
    .from("studio_widgets")
    .select("id, org_id, widget_config, version")
    .eq("id", widgetId)
    .single();
  if (rerr) throw rerr;
  if (w.org_id !== orgId) throw new Error("Not allowed");

  const nextVersion = (w.version ?? 1) + 1;

  // Update the published config and version
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: uerr } = await (adminSupabase as any)
    .from("studio_widgets")
    .update({
      published_config: w.widget_config,
      published_at: new Date().toISOString(),
      version: nextVersion,
    })
    .eq("id", widgetId);
  if (uerr) throw uerr;

  // Record version history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: verr } = await (adminSupabase as any)
    .from("studio_widget_versions")
    .insert({ 
      widget_id: widgetId, 
      org_id: orgId, 
      version: nextVersion, 
      config: w.widget_config 
    });
  if (verr) throw verr;
  
  return { version: nextVersion };
}
