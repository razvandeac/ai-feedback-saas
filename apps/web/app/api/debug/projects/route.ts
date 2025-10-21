import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await getRouteSupabase()
    
    // Check if we can query projects at all
    const { data: allProjects, error: allError } = await supabase
      .from('projects')
      .select('id, name, key, api_key, org_id, created_at')
      .limit(10)
    
    // Check organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .limit(10)
    
    // Check if there are any projects for the demo org specifically
    const { data: demoProjects, error: demoError } = await supabase
      .from('projects')
      .select('id, name, key, api_key, org_id, created_at')
      .eq('org_id', 'a9523bc1-fff1-4773-bdba-dd494d055ba8') // Demo org ID
    
    return NextResponse.json({
      allProjects: allProjects || [],
      allProjectsError: allError,
      organizations: orgs || [],
      orgsError: orgError,
      demoProjects: demoProjects || [],
      demoProjectsError: demoError,
      totalProjects: allProjects?.length || 0,
      totalOrgs: orgs?.length || 0
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
