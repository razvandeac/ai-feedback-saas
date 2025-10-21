import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await getRouteSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's organizations
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        created_at,
        org_members!inner(role, created_at)
      `)
      .eq('org_members.user_id', user.id)
      .order('org_members.created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      has_orgs: (orgs?.length ?? 0) > 0,
      org_count: orgs?.length ?? 0,
      organizations: orgs?.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: org.org_members[0]?.role,
        member_since: org.org_members[0]?.created_at,
        created_at: org.created_at
      })) ?? []
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
