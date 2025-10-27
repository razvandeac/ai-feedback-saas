import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import Studio from '../studio-client'
import { WidgetConfigSchema } from '@/src/lib/studio/WidgetConfigSchema'
import { getProjectWithWidget } from '@/src/server/projects/repo'

export default async function StudioPage({ 
  params 
}: { 
  params: Promise<{ slug: string; id: string; widgetId: string }> 
}) {
  const { id, slug, widgetId } = await params
  const adminSupabase = getSupabaseAdmin()
  
  console.log('Studio page loaded with params:', { id, slug, widgetId })

  // Get project with widget information
  const proj = await getProjectWithWidget(id)
  if (!proj) notFound()

  // Verify the widgetId matches the project's widget
  if (proj.widget?.id && proj.widget.id !== widgetId) {
    console.error('Widget ID mismatch:', { expected: proj.widget.id, received: widgetId })
    notFound()
  }

  // Get the widget config from the studio_widgets table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: widget, error: widgetError } = await (adminSupabase as any)
    .from('studio_widgets')
    .select('widget_config, published_config')
    .eq('id', widgetId)
    .single()

  if (widgetError) {
    console.error('Error fetching widget:', widgetError)
    console.error('Widget ID:', widgetId)
    notFound()
  }
  
  console.log('Fetched widget config:', widget)

  // Parse widget config or create default
  let initialConfig
  try {
    // Use widget_config if available, fallback to published_config, then default
    const configData = widget?.widget_config || widget?.published_config
    if (configData) {
      initialConfig = WidgetConfigSchema.parse(configData)
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
      <Studio widgetId={widgetId} orgId={proj.org_id} initialConfig={initialConfig} />
    </main>
  )
}
