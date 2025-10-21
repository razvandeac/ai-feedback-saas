import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    
    // Check current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Try to query tables to see if they exist
    const tablesExist = { organizations: false, org_members: false }
    try {
      await supabase.from('organizations').select('id').limit(1)
      tablesExist.organizations = true
    } catch {
      tablesExist.organizations = false
    }
    
    try {
      await (supabase as any).from('org_members').select('id').limit(1) // eslint-disable-line @typescript-eslint/no-explicit-any
      tablesExist.org_members = true
    } catch {
      tablesExist.org_members = false
    }

    // Try to count existing data
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    let memberCount = 0
    let userMemberships = []
    
    if (tablesExist.org_members && user) {
      try {
        const { count } = await (supabase as any).from('org_members').select('*', { count: 'exact', head: true }) // eslint-disable-line @typescript-eslint/no-explicit-any
        memberCount = count || 0
        
        const { data: memberships } = await (supabase as any).from('org_members') // eslint-disable-line @typescript-eslint/no-explicit-any
          .select('org_id, role, created_at')
          .eq('user_id', user.id)
        userMemberships = memberships || []
      } catch {
        memberCount = 0
        userMemberships = []
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      user: user ? { 
        id: user.id, 
        email: user.email,
        memberships: userMemberships
      } : null,
      tables_exist: tablesExist,
      counts: {
        organizations: orgCount || 0,
        org_members: memberCount
      },
      user_memberships: userMemberships
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
