'use server'
import { redirect } from 'next/navigation'
import { getRouteSupabase } from '@/lib/supabaseServer'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function createOrg(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) {
    // For form actions, we can't return errors, so we'll redirect to an error page
    redirect('/orgs?error=name-required')
  }

  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Reserve a unique slug in app layer (retry on collision)
  const base = slugify(name); let slug = base; let n = 1
  while (true) {
    const { data } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle()
    if (!data) break
    slug = `${base}-${++n}`
  }

  // Let RLS decide if user can insert (must be platform admin)
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name, slug })
    .select('id, slug')
    .single()

  if (error || !org) {
    const isPermissionError = /permission denied|rls|not authorized/i.test(error?.message ?? '')
    if (isPermissionError) {
      redirect('/orgs?error=platform-admin-required')
    } else {
      redirect('/orgs?error=create-failed')
    }
  }

  // Make creator admin of the new org
  await supabase.from('org_members').insert({ org_id: org.id, user_id: user.id, role: 'admin' })

  redirect(`/org/${org.slug}`)
}
