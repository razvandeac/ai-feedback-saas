import { NextResponse } from 'next/server'

export async function GET() {
  // Test environment variables
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    serviceRoleStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'undefined'
  }
  
  return NextResponse.json(envCheck)
}
