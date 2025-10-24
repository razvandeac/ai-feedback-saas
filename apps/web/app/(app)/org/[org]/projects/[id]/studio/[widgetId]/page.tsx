import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import Studio from './studio-client'
import { WidgetConfigSchema } from '@/src/lib/studio/WidgetConfigSchema'
import { getProjectWithWidget, ensureProjectWidget } from '@/src/server/projects/repo'

export default async function StudioPage({ 
  params 
}: { 
  params: Promise<{ org: string; id: string; widgetId: string }> 
}) {
  const { id, widgetId } = await params
  const adminSupabase = getSupabaseAdmin()

  // Get project with widget information
  const proj = await getProjectWithWidget(id)
  if (!proj) notFound()

  // Ensure widget exists for this project
  const finalWidgetId = proj.widget?.id || await ensureProjectWidget(proj.id, proj.org_id)

  // Get the widget config from the studio_widgets table
  const { data: widget } = await (adminSupabase as any)
    .from('studio_widgets')
    .select('widget_config')
    .eq('id', finalWidgetId)
    .single()

  // Parse widget config or create default
  let initialConfig
  try {
    if (widget?.widget_config) {
      initialConfig = WidgetConfigSchema.parse(widget.widget_config)
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
      <Studio 
        widgetId={finalWidgetId} 
        orgId={proj.org_id} 
        initialConfig={initialConfig} 
      />
    </main>
  )
}
