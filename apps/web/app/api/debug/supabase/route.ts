import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !serviceRole) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasUrl: !!url,
        hasServiceRole: !!serviceRole
      })
    }
    
    // Test direct connection
    const supabase = createClient(url, serviceRole)
    
    // Try a simple query
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      hasUrl: !!url,
      hasServiceRole: !!serviceRole,
      url: url,
      serviceRoleLength: serviceRole.length,
      serviceRoleStart: serviceRole.substring(0, 20),
      queryResult: { data, error }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
  }
}
