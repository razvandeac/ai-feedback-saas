import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json()
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    
    // Use RPC function to get user emails
    const { data, error } = await admin
      .rpc('get_users_lite', { ids: userIds })

    if (error) {
      console.error('RPC error:', error)
      // Fallback: return user IDs with fake emails
      const users = userIds.map(id => ({
        id,
        email: `user-${id.slice(0, 8)}@example.com`,
        full_name: null
      }))
      return NextResponse.json({ users })
    }

    // Format the response
    const users = data?.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name || null
    })) || []

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
