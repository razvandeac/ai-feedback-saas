'use server'

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { WidgetConfigSchema } from '@/lib/widget/schema'

export async function loadWidgetConfig(projectId: string) {
  const adminSupabase = getSupabaseAdmin()

  const { data, error } = await adminSupabase
    .from('widget_config')
    .select('settings')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) return { error: error.message }
  return { settings: (data?.settings ?? {}) }
}

export async function saveWidgetConfig(projectId: string, draft: unknown) {
  const adminSupabase = getSupabaseAdmin()

  console.log('Saving widget config for project:', projectId)
  console.log('Draft data:', draft)

  const parsed = WidgetConfigSchema.safeParse(draft)
  if (!parsed.success) {
    console.error('Widget config validation failed:', parsed.error)
    const first = parsed.error.issues?.[0]
    return { error: `Invalid config: ${first?.path?.join('.') ?? ''} ${first?.message ?? ''}` }
  }

  console.log('Parsed config:', parsed.data)

  // Always save in the new format using admin client to bypass RLS
  const { error } = await adminSupabase
    .from('widget_config')
    .upsert({ 
      project_id: projectId, 
      settings: parsed.data, 
      updated_at: new Date().toISOString() 
    })
  if (error) {
    console.error('Database error:', error)
    return { error: error.message }
  }

  return { ok: true }
}
