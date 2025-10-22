import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    
    // Try to select all data to see what's actually there
    const { data: allMembers, error: selectError } = await (supabase as any).from('org_members') // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('*')
      .limit(5)

    // Try different column combinations to see what works
    const testQueries = [
      { name: 'select_id', query: () => (supabase as any).from('org_members').select('id').limit(1) }, // eslint-disable-line @typescript-eslint/no-explicit-any
      { name: 'select_org_id', query: () => (supabase as any).from('org_members').select('org_id').limit(1) }, // eslint-disable-line @typescript-eslint/no-explicit-any
      { name: 'select_user_id', query: () => (supabase as any).from('org_members').select('user_id').limit(1) }, // eslint-disable-line @typescript-eslint/no-explicit-any
      { name: 'select_role', query: () => (supabase as any).from('org_members').select('role').limit(1) }, // eslint-disable-line @typescript-eslint/no-explicit-any
    ]

    const queryResults: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const test of testQueries) {
      try {
        const { data, error } = await test.query()
        queryResults[test.name] = { success: true, data, error: error?.message }
      } catch (e) {
        queryResults[test.name] = { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sample_data: allMembers || [],
      select_error: selectError?.message,
      column_tests: queryResults
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
