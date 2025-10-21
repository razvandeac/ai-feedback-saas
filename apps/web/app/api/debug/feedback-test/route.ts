import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json()
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key provided' }, { status: 400 })
    }

    const supabase = await getRouteSupabase()
    
    // Test the exact same query as the feedback API
    const { data: proj, error: perr } = await supabase
      .from('projects')
      .select('id, org_id')
      .eq('key', apiKey)
      .single()

    return NextResponse.json({
      providedKey: apiKey,
      foundProject: proj,
      projectError: perr,
      success: !perr && !!proj
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
