import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json()
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    
    // Try to get user emails using available RPC functions
    let data, error;
    
    // First try get_users_lite (exists in both local and production)
    const result1 = await admin.rpc('get_users_lite', { ids: userIds });
    if (!result1.error && result1.data) {
      data = result1.data;
      error = null;
    } else {
      // If that fails, try get_user_emails_simple (production only)
      const result2 = await admin.rpc('get_user_emails_simple', { user_ids: userIds });
      data = result2.data;
      error = result2.error;
    }

    if (error || !data) {
      console.error('RPC error:', error)
      // Fallback: return user IDs with fake emails
      const users = userIds.map(id => ({
        id,
        email: `user-${id.slice(0, 8)}@example.com`,
        full_name: null
      }))
      return NextResponse.json({ users })
    }

    // Format the response - handle both function formats
    const users = data?.map((user: any) => ({
      id: user.user_id || user.id, // Handle both formats
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
