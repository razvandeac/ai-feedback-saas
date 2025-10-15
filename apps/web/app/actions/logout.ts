'use server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function signOut() {
  const supabase = await getRouteSupabase()
  await supabase.auth.signOut()
}
