import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function POST() {
  try {
    const supabase = await getRouteSupabase()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the existing organization using admin client to bypass RLS
    const { getSupabaseAdmin } = await import('@/lib/supabaseAdmin')
    const adminSupabase = getSupabaseAdmin()
    
    const { data: orgs } = await adminSupabase
      .from('organizations')
      .select('id, name, slug')
      .order('created_at', { ascending: false })
      .limit(1)

    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ error: 'No organizations found' }, { status: 404 })
    }

    const org = orgs[0]
    console.log('Found organization:', org)

    // Check if user is already a member using admin client
    const { data: existingMember } = await (adminSupabase as any).from('org_members') // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('id')
      .eq('org_id', org.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({ 
        message: 'User is already a member',
        org: org,
        membership: existingMember
      })
    }

    // Add user as admin of the existing organization
    // adminSupabase is already available from above
    
    const { data: member, error: memberError } = await (adminSupabase as any).from('org_members') // eslint-disable-line @typescript-eslint/no-explicit-any
      .insert({ 
        org_id: org.id, 
        user_id: user.id, 
        role: 'admin' 
      })
      .select('id, role, created_at')
      .single()

    if (memberError) {
      console.error('Member creation failed:', memberError)
      return NextResponse.json({ 
        error: 'Failed to add user as member',
        details: memberError.message,
        code: memberError.code,
        org: org
      }, { status: 400 })
    }

    console.log('Member created successfully:', member)

    return NextResponse.json({ 
      success: true, 
      message: 'User added as admin to existing organization',
      org: org,
      membership: member
    })
    
  } catch (error) {
    console.error('Fix failed with exception:', error)
    return NextResponse.json({ 
      error: 'Fix failed with exception',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
