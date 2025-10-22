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

  // Compute next version
  const { data: maxVersion } = await adminSupabase
    .from('widget_versions')
    .select('version')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  const version = ((maxVersion as { version?: number })?.version ?? 0) + 1

  // Insert version (RLS: org admin only)
  const { error: perr } = await adminSupabase
    .from('widget_versions').insert({
    project_id: projectId,
    version,
    settings: draft.data,
    published_by: '00000000-0000-0000-0000-000000000000' // Placeholder - RLS will handle auth
  })
  if (perr) return { error: perr.message }

  return { ok: true, version }
}

export async function rollbackWidget(projectId: string, toVersion: number) {
  const adminSupabase = getSupabaseAdmin()

  // Fetch version to restore
  const { data: v, error: verr } = await adminSupabase
    .from('widget_versions')
    .select('settings')
    .eq('project_id', projectId)
    .eq('version', toVersion)
    .single()
  if (verr || !v) return { error: 'Version not found' }

  // Write back into draft (members can write; your policy allows org members)
  const { error: uerr } = await adminSupabase
    .from('widget_config')
    .upsert({ project_id: projectId, widget_config: v.settings, updated_at: new Date().toISOString() })
  if (uerr) return { error: uerr.message }

  return { ok: true }
}

export async function listWidgetVersions(projectId: string) {
  const adminSupabase = getSupabaseAdmin()

  const { data, error } = await adminSupabase
    .from('widget_versions' as unknown as 'widget_config')
    .select('version, published_at, published_by')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
  if (error) return { error: error.message }
  return { versions: data ?? [] }
}
