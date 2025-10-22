import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import Studio from './studio-client'
import { WidgetConfigSchema } from '@/src/lib/studio/WidgetConfigSchema'

export default async function StudioPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params
  const adminSupabase = getSupabaseAdmin()

  // Use admin client to bypass RLS issues
  const [{ data: proj }, { data: cfg }] = await Promise.all([
    adminSupabase.from('projects').select('id, name, org_id').eq('id', id).single(),
    adminSupabase.from('widget_config').select('widget_config').eq('project_id', id).maybeSingle()
  ])
  if (!proj) notFound()

  // Parse widget config or create default
  let initialConfig
  try {
    if (cfg?.widget_config) {
      initialConfig = WidgetConfigSchema.parse(cfg.widget_config)
    } else {
      // Create default config
      initialConfig = WidgetConfigSchema.parse({
        theme: {
          variant: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter',
          borderRadius: 8,
        },
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            data: { text: 'Welcome to Studio', align: 'left' },
          },
        ],
      })
    }
  } catch (error) {
    console.error('Failed to parse widget config:', error)
    notFound()
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Widget Studio · {proj.name}</h1>
      <Studio projectId={proj.id} orgId={proj.org_id} initialConfig={initialConfig} />
    </main>
  )
}
