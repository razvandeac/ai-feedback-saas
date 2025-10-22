import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const adminSupabase = getSupabaseAdmin()
    
    // Get recent invites
    const { data: invites, error } = await adminSupabase
      .from('org_invites')
      .select('id, email, role, status, created_at, invited_by, token')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      invites: invites || [],
      count: invites?.length || 0,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_DEV_TO: process.env.EMAIL_DEV_TO
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch invites',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
