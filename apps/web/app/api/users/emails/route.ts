import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json()
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    // Debug environment variables
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    });

    const admin = getSupabaseAdmin()
    
    // Try to get user emails using available RPC functions
    let data, error;
    
    // Use get_users_lite function
    console.log('Trying get_users_lite with userIds:', userIds);
    const result = await admin.rpc('get_users_lite', { ids: userIds });
    console.log('get_users_lite result:', { data: result.data, error: result.error });
    
    if (!result.error && result.data && result.data.length > 0) {
      data = result.data;
      error = null;
      console.log('Using get_users_lite data:', data);
    } else {
      data = null;
      error = result.error;
      console.log('get_users_lite failed:', result.error);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
