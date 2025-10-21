import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    const supabase = getSupabaseAdmin()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Try to create a test organization
    const testOrgName = `Test Org ${Date.now()}`
    const testSlug = `test-org-${Date.now()}`
    
    console.log('Attempting to create organization:', { testOrgName, testSlug, userId: user.id })
    
    // Step 1: Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: testOrgName, slug: testSlug })
      .select('id, slug')
      .single()
    
    if (orgError) {
      console.error('Organization creation failed:', orgError)
      return NextResponse.json({ 
        step: 'organization_creation',
        error: orgError.message,
        code: orgError.code,
        details: orgError.details,
        hint: orgError.hint
      }, { status: 400 })
    }
    
    console.log('Organization created successfully:', org)
    
    // Step 2: Add user as admin (table might not exist)
    let memberError = null
    try {
      const result = await (supabase as any).from('org_members').insert({ // eslint-disable-line @typescript-eslint/no-explicit-any
        org_id: org.id, 
        user_id: user.id, 
        role: 'admin' 
      })
      memberError = result.error
    } catch (e) {
      memberError = { message: 'org_members table does not exist' }
    }
    
    if (memberError) {
      console.error('Member creation failed:', memberError)
      return NextResponse.json({ 
        step: 'member_creation',
        error: memberError.message,
        code: memberError.code,
        details: memberError.details,
        hint: memberError.hint,
        org_id: org.id
      }, { status: 400 })
    }
    
    console.log('Member created successfully')
    
    // Clean up test data
    try {
      await (supabase as any).from('org_members').delete().eq('org_id', org.id) // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch {
      // org_members table might not exist
    }
    await supabase.from('organizations').delete().eq('id', org.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test organization creation successful',
      test_org: org
    })
    
  } catch (error) {
    console.error('Test failed with exception:', error)
    return NextResponse.json({ 
      error: 'Test failed with exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
