import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    const adminSupabase = getSupabaseAdmin()
    
    // Get the demo project
    const { data: project } = await adminSupabase
      .from('projects')
      .select('id, name, key')
      .eq('key', 'y577qucpaczh6fty')
      .single()
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Try to insert feedback directly
    const { data, error } = await adminSupabase
      .from('feedback')
      .insert({ 
        project_id: project.id, 
        rating: 5, 
        comment: 'Direct test insertion' 
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ 
        error: 'Feedback insertion failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      feedback: data,
      project: project
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
