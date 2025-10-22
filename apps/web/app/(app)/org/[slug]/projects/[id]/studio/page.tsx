import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import Studio from './studio-client'
import { DEFAULT_WIDGET_CONFIG } from '@/lib/widget/schema'

export default async function StudioPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params
  const adminSupabase = getSupabaseAdmin()

  // Use admin client to bypass RLS issues
  const [{ data: proj }, { data: cfg }] = await Promise.all([
    adminSupabase.from('projects').select('id, name, org_id').eq('id', id).single(),
    adminSupabase.from('widget_config').select('settings').eq('project_id', id).maybeSingle()
  ])
  if (!proj) notFound()

  const initial = (cfg?.settings ?? DEFAULT_WIDGET_CONFIG)

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Widget Studio · {proj.name}</h1>
      <Studio projectId={proj.id} initial={initial} />
    </main>
  )
}
