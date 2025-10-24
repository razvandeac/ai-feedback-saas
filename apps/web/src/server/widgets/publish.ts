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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: uerr } = await (adminSupabase as any)
    .from("studio_widgets")
    .update({
      published_config: w.widget_config,
      published_at: new Date().toISOString(),
      version: (w.version ?? 1) + 1,
    })
    .eq("id", widgetId);
  if (uerr) throw uerr;
}
