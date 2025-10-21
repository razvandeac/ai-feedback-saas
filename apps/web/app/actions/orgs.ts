'use server'
import { redirect } from 'next/navigation'
import { getRouteSupabase } from '@/lib/supabaseServer'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function createOrg(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return

  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const base = slugify(name); let slug = base; let n = 1
  // try to reserve a unique slug
  while (true) {
    const { data } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle()
    if (!data) break
    slug = `${base}-${++n}`
  }

  const { data: org, error } = await supabase.from('organizations')
    .insert({ name, slug })
    .select('id, slug')
    .single()
  if (error || !org) return

  await supabase.from('org_members').insert({ org_id: org.id, user_id: user.id, role: 'admin' })
  redirect(`/org/${org.slug}`)
}
