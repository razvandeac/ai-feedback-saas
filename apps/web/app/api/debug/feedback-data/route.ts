import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const adminSupabase = getSupabaseAdmin()
    
    // Get the demo org
    const { data: org } = await adminSupabase
      .from('organizations')
      .select('id, name, slug')
      .eq('slug', 'demo')
      .single()
    
    if (!org) {
      return NextResponse.json({ error: 'Demo org not found' }, { status: 404 })
    }
    
    // Get projects for this org
    const { data: projects } = await adminSupabase
      .from('projects')
      .select('id, name, key')
      .eq('org_id', org.id)
    
    const projectIds = projects?.map(p => p.id) || []
    
    // Get recent feedback
    const { data: feedback, count } = await adminSupabase
      .from('feedback')
      .select('id, project_id, rating, comment, created_at', { count: 'exact' })
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Get recent events
    const { data: events, count: eventCount } = await adminSupabase
      .from('events')
      .select('id, project_id, type, payload, created_at', { count: 'exact' })
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return NextResponse.json({
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug
      },
      projects: projects || [],
      feedback: {
        data: feedback || [],
        count: count || 0
      },
      events: {
        data: events || [],
        count: eventCount || 0
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
