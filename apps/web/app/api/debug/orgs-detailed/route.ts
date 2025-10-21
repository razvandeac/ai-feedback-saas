import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const supabase = await getRouteSupabase()
    const adminSupabase = getSupabaseAdmin()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Try both clients to see organizations
    const { data: orgsRoute, error: orgsRouteError } = await supabase
      .from('organizations')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: false })

    const { data: orgsAdmin, error: orgsAdminError } = await adminSupabase
      .from('organizations')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: false })

    // Count organizations with both clients
    const { count: countRoute } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { count: countAdmin } = await adminSupabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      user: user ? { 
        id: user.id, 
        email: user.email
      } : null,
      organizations: {
        route_client: {
          data: orgsRoute,
          error: orgsRouteError?.message,
          count: countRoute
        },
        admin_client: {
          data: orgsAdmin,
          error: orgsAdminError?.message,
          count: countAdmin
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
