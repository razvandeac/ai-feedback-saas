import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json()
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key provided' }, { status: 400 })
    }

    const supabase = await getRouteSupabase()
    
    // Debug: Check all projects
    const { data: allProjects, error: allError } = await supabase
      .from('projects')
      .select('id, name, api_key, org_id')
      .limit(10)
    
    // Debug: Try to find the specific project
    const { data: proj, error: perr } = await supabase
      .from('projects')
      .select('id, name, api_key, org_id')
      .eq('api_key', apiKey)
      .single()

    return NextResponse.json({
      providedKey: apiKey,
      keyLength: apiKey.length,
      keyFirstChars: apiKey.substring(0, 10),
      keyLastChars: apiKey.substring(apiKey.length - 10),
      allProjects: allProjects?.map(p => ({
        id: p.id,
        name: p.name,
        apiKey: p.api_key,
        keyLength: p.api_key?.length
      })),
      foundProject: proj,
      projectError: perr,
      allProjectsError: allError
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
