import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const adminSupabase = getSupabaseAdmin()
    
    // Check the specific project key
    const projectKey = 'y577qucpaczh6fty'
    
    const { data: project, error } = await adminSupabase
      .from('projects')
      .select('id, name, key, allowed_origins, require_project_origins')
      .eq('key', projectKey)
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        allowed_origins: project.allowed_origins,
        require_project_origins: project.require_project_origins
      },
      environment: {
        CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
        CORS_ALLOW_NO_ORIGIN: process.env.CORS_ALLOW_NO_ORIGIN,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
