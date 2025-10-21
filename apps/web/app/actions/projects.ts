'use server'
import { redirect } from 'next/navigation'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function createProject(formData: FormData) {
  const orgId = String(formData.get('org_id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  if (!orgId || !name) return

  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: proj, error } = await supabase.from('projects')
    .insert({ org_id: orgId, name })
    .select('id')
    .single()
  if (error || !proj) return

  redirect(`/projects/${proj.id}`)
}

export async function regenProjectKey(projectId: string) {
  const supabase = await getRouteSupabase()
  const { data: current } = await supabase.from('projects').select('org_id').eq('id', projectId).single()
  if (!current) return { error: 'Not found' }
  // admin-only enforced by RLS update
  const { data } = await supabase.rpc('gen_random_bytes', { len: 16 } as Record<string, unknown>) // fallback if unavailable: use SQL default via update
  const newKey = (data ? Buffer.from(data as Uint8Array).toString('hex') : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0,32)
  const { error: uerr, data: updated } = await supabase.from('projects').update({ api_key: newKey }).eq('id', projectId).select('api_key').single()
  if (uerr) return { error: uerr.message }
  return { ok: true, api_key: updated?.api_key }
}
