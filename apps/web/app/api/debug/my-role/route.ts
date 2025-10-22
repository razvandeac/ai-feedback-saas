import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const supabase = await getRouteSupabase()
    const adminSupabase = getSupabaseAdmin()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all organizations and user's role in each
    const { data: memberships } = await (adminSupabase as any).from('org_members') // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('org_id, role, organizations(id, name, slug)')
      .eq('user_id', user.id)

    const orgsWithRoles = (memberships || []).map((m: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      org_id: m.org_id,
      role: m.role,
      org_name: m.organizations?.name,
      org_slug: m.organizations?.slug,
      is_admin: ['admin', 'owner'].includes(m.role)
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      memberships: orgsWithRoles,
      total_orgs: orgsWithRoles.length,
      admin_orgs: orgsWithRoles.filter((o: any) => o.is_admin).length // eslint-disable-line @typescript-eslint/no-explicit-any
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
