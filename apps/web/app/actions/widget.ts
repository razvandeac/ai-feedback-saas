'use server'

import { z } from 'zod'
import { getRouteSupabase } from '@/lib/supabaseServer'
import { WidgetConfigSchema } from '@/lib/widget/schema'

export async function loadWidgetConfig(projectId: string) {
  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data, error } = await supabase
    .from('widget_config')
    .select('settings')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) return { error: error.message }
  return { settings: (data?.settings ?? {}) }
}

export async function saveWidgetConfig(projectId: string, draft: unknown) {
  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const parsed = WidgetConfigSchema.safeParse(draft)
  if (!parsed.success) {
    const first = parsed.error.issues?.[0]
    return { error: `Invalid config: ${first?.path?.join('.') ?? ''} ${first?.message ?? ''}` }
  }

  const { error } = await supabase
    .from('widget_config')
    .upsert({ project_id: projectId, settings: parsed.data, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }

  return { ok: true }
}
