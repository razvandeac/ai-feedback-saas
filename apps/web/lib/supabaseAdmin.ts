// apps/web/lib/supabaseAdmin.ts
// Admin client (server-only). Uses service_role and bypasses RLS.
// Never import in client/browser code.
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('SupabaseAdmin environment check:', {
      hasUrl: !!url,
      hasServiceRole: !!serviceRole,
      urlLength: url?.length || 0,
      serviceRoleLength: serviceRole?.length || 0,
      serviceRoleStart: serviceRole?.substring(0, 10) || 'undefined'
    });
    
    if (!url || !serviceRole) {
      console.error('Missing environment variables:', { url: !!url, serviceRole: !!serviceRole });
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    
    supabaseAdminInstance = createClient<Database>(url, serviceRole)
  }
  return supabaseAdminInstance
}
