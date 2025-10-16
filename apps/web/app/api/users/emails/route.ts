import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json()
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    
    // Try to get user emails using a direct query approach
    // First, try to get from profiles table
    const { data: profilesData, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds)

    if (profilesError) {
      console.error('Profiles query error:', profilesError)
    }

    // Create user map with available data
    const users = userIds.map(id => {
      const profile = profilesData?.find(p => p.user_id === id)
      return {
        id,
        email: `user-${id.slice(0, 8)}@example.com`, // Still fake for now
        full_name: profile?.full_name || null
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('API error:', error)
    // Fallback: return user IDs with fake emails
    const { userIds } = await request.json()
    const users = userIds.map((id: string) => ({
      id,
      email: `user-${id.slice(0, 8)}@example.com`,
      full_name: null
    }))
    return NextResponse.json({ users })
  }
}
