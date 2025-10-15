import { NextResponse } from 'next/server'
import { getRouteSupabase } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (code) {
    const supabase = await getRouteSupabase()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL('/dashboard', url.origin))
}
