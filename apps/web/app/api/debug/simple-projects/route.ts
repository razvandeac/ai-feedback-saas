import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const admin = getSupabaseAdmin()
    
    // Use admin client to bypass RLS
    const { data: projects, error } = await admin
      .from('projects')
      .select('id, name, key, api_key, org_id, created_at')
      .limit(10)
    
    return NextResponse.json({
      projects: projects || [],
      error: error,
      count: projects?.length || 0
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
