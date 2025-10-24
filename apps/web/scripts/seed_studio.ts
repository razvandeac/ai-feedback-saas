import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

async function seedStudio() {
  const adminSupabase = getSupabaseAdmin()
  
  // Create a test organization
  const { data: org } = await adminSupabase
    .from('organizations')
    .insert({
      name: 'Studio Test Org',
      slug: 'studio-test',
      created_by: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
    })
    .select()
    .single()

  if (!org) {
    console.error('Failed to create organization')
    return
  }

  // Create a test project
  const { data: project } = await adminSupabase
    .from('projects')
    .insert({
      org_id: org.id,
      name: 'Studio Test Project',
      key: 'test-key-' + Math.random().toString(36).substr(2, 9),
    })
    .select()
    .single()

  if (!project) {
    console.error('Failed to create project')
    return
  }

  // Create a widget config
  const widgetConfig = {
    theme: {
      variant: 'light',
      primaryColor: '#111111',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      borderRadius: 8,
    },
    blocks: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        version: 1,
        data: { text: 'Hello Studio', align: 'left' },
      },
      {
        id: crypto.randomUUID(),
        type: 'image',
        version: 1,
        data: { url: 'https://placehold.co/600x400', alt: 'demo' },
      },
    ],
  }

  // Create studio widget
  const { data: widget } = await adminSupabase
    .from('studio_widgets')
    .insert({
      org_id: org.id,
      name: 'Studio Test Widget',
      widget_config: widgetConfig,
      published_config: widgetConfig,
    })
    .select()
    .single()

  if (!widget) {
    console.error('Failed to create studio widget')
    return
  }

  // Link widget to project
  await adminSupabase
    .from('projects')
    .update({ widget_id: widget.id })
    .eq('id', project.id)

  console.log('✅ Studio seeded successfully!')
  console.log(`Organization: ${org.name} (${org.slug})`)
  console.log(`Project: ${project.name} (${project.key})`)
  console.log(`Widget: ${widget.name} (${widget.id})`)
  console.log(`Widget Config: ${JSON.stringify(widgetConfig, null, 2)}`)
}

if (require.main === module) {
  seedStudio().catch(console.error)
}

export { seedStudio }
