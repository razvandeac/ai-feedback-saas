'use server'

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { WidgetConfigSchema } from '@/src/lib/studio/WidgetConfigSchema'

export async function loadWidgetConfig(projectId: string) {
  const adminSupabase = getSupabaseAdmin()

  const { data, error } = await adminSupabase
    .from('widget_config')
    .select('widget_config')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) return { error: error.message }
  return { settings: (data?.widget_config ?? {}) }
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
      widget_config: parsed.data, 
      updated_at: new Date().toISOString() 
    })
  if (error) {
    console.error('Database error:', error)
    return { error: error.message }
  }

  return { ok: true }
}

export async function publishWidget(projectId: string) {
  const adminSupabase = getSupabaseAdmin()

  // Load current draft
  const { data: cfg, error: cerr } = await adminSupabase
    .from('widget_config')
    .select('widget_config')
    .eq('project_id', projectId)
    .maybeSingle()
  if (cerr) return { error: cerr.message }

  const draft = WidgetConfigSchema.safeParse(cfg?.widget_config ?? {})
  if (!draft.success) return { error: 'Invalid draft settings' }

  // Get current widget for this project
  const { data: widget, error: werr } = await adminSupabase
    .from('widgets')
    .select('id, version')
    .eq('project_id', projectId)
    .maybeSingle()
  if (werr) return { error: werr.message }

  const currentVersion = widget?.version ?? 0
  const nextVersion = currentVersion + 1

  // Update or insert widget with published config
  const { error: perr } = await adminSupabase
    .from('widgets')
    .upsert({
      project_id: projectId,
      published_config: draft.data,
      published_at: new Date().toISOString(),
      version: nextVersion,
      config: draft.data, // Also update the draft config
      updated_at: new Date().toISOString()
    }, { onConflict: 'project_id' })
  if (perr) return { error: perr.message }

  return { ok: true, version: nextVersion }
}

export async function rollbackWidget(projectId: string, toVersion: number) {
  const adminSupabase = getSupabaseAdmin()

  // For now, we'll implement a simple rollback that just resets to the published config
  // In a more complex system, you might want to store version history
  const { data: widget, error: werr } = await adminSupabase
    .from('widgets')
    .select('published_config')
    .eq('project_id', projectId)
    .maybeSingle()
  if (werr || !widget) return { error: 'Widget not found' }

  // Write the published config back to the draft
  const { error: uerr } = await adminSupabase
    .from('widget_config')
    .upsert({ 
      project_id: projectId, 
      widget_config: widget.published_config, 
      updated_at: new Date().toISOString() 
    })
  if (uerr) return { error: uerr.message }

  return { ok: true }
}

export async function listWidgetVersions(projectId: string) {
  const adminSupabase = getSupabaseAdmin()

  // For now, return a simple version info since we're using widgets table
  const { data: widget, error } = await adminSupabase
    .from('widgets')
    .select('version, published_at')
    .eq('project_id', projectId)
    .maybeSingle()
  if (error) return { error: error.message }
  
  // Return a simple version list with current published version
  const versions = widget ? [{
    version: widget.version ?? 1,
    published_at: widget.published_at,
    published_by: null // We don't track this in the simple widgets table
  }] : []
  
  return { versions }
}
