import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key') || ''
  if (!key) return NextResponse.json({ error: 'missing_key' }, { status: 400 })

  const supabase = await getRouteSupabase()

  // find project by api_key
  const { data: proj } = await supabase
    .from('projects').select('id').eq('key', key).maybeSingle()
  if (!proj) return NextResponse.json({ error: 'invalid_key' }, { status: 404 })

  // 1) try latest published version
  const { data: ver } = await supabase
    .from('widget_versions' as unknown as 'widget_config')
    .select('settings, version')
    .eq('project_id', proj.id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (ver?.settings) {
    return NextResponse.json({ settings: ver.settings, version: ver.version, mode: 'published' }, { status: 200 })
  }

  // 2) fallback to draft
  const { data: cfg } = await supabase
    .from('widget_config').select('settings').eq('project_id', proj.id).maybeSingle()

  return NextResponse.json({ settings: cfg?.settings ?? {}, version: null, mode: 'draft' }, { status: 200 })
}
