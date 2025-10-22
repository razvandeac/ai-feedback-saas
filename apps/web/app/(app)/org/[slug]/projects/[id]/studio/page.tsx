import { notFound } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Studio from './studio-client'
import { DEFAULT_WIDGET_CONFIG } from '@/lib/widget/schema'

export default async function StudioPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // ensure project belongs to org; also fetch existing config
  const [{ data: proj }, { data: cfg }] = await Promise.all([
    supabase.from('projects').select('id, name, org_id').eq('id', id).single(),
    supabase.from('widget_config').select('settings').eq('project_id', id).maybeSingle()
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
