import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { WidgetUpdateDTO } from "./dto";

export async function getWidgetById(id: string) {
  const adminSupabase = getSupabaseAdmin();
  const { data, error } = await adminSupabase.from("widget_config").select("*").eq("project_id", id).single();
  if (error) throw error;
  return data;
}

export async function updateWidget(id: string, payload: WidgetUpdateDTO) {
  const adminSupabase = getSupabaseAdmin();
  const { error } = await adminSupabase
    .from("widget_config")
    .update({ widget_config: payload.widget_config })
    .eq("project_id", id);
  if (error) throw error;
}
