// apps/web/lib/supabaseAdmin.ts
// Admin client (server-only). Uses service_role; NEVER import in client code.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRole) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

export const supabaseAdmin = createClient(url, serviceRole)
