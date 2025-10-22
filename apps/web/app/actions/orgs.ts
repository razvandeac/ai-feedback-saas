'use server'
import { redirect } from 'next/navigation'
import { getRouteSupabase } from '@/lib/supabaseServer'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function createOrg(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: 'Name required' }

  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

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
    const msg = /permission denied|rls|not authorized/i.test(error?.message ?? '')
      ? 'Only platform admins can create organizations.'
      : (error?.message ?? 'Create failed')
    return { error: msg }
  }

  // Make creator admin of the new org
  await supabase.from('org_members').insert({ org_id: org.id, user_id: user.id, role: 'admin' })

  redirect(`/org/${org.slug}`)
}
