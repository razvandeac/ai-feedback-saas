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

  const { data: cfg } = await supabase
    .from('widget_config').select('settings').eq('project_id', proj.id).maybeSingle()

  return NextResponse.json({ settings: cfg?.settings ?? {} }, { status: 200 })
}
