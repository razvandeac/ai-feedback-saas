'use server'
import { redirect } from 'next/navigation'
import { getRouteSupabase } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function createOrg(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return

  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Use admin client to bypass RLS for organization creation
  const adminSupabase = getSupabaseAdmin()

  const base = slugify(name); let slug = base; let n = 1
  // try to reserve a unique slug (with safety limit)
  let attempts = 0
  while (attempts < 100) {
    const { data, error } = await adminSupabase.from('organizations').select('id').eq('slug', slug).maybeSingle()
    if (error) {
      console.error('Error checking slug uniqueness:', error)
      break // Exit loop on error
    }
    if (!data) break
    slug = `${base}-${++n}`
    attempts++
  }

  const { data: org, error } = await adminSupabase.from('organizations')
    .insert({ name, slug })
    .select('id, slug')
    .single()
  if (error) {
    console.error('Error creating organization:', error)
    return
  }
  if (!org) {
    console.error('No organization returned from insert')
    return
  }

  // Try to add user as admin (table might not exist yet)
  try {
    const { error: memberError } = await (adminSupabase as any).from('org_members').insert({ // eslint-disable-line @typescript-eslint/no-explicit-any 
      org_id: org.id, 
      user_id: user.id, 
      role: 'admin' 
    })
    if (memberError) {
      console.error('Error adding user as admin:', memberError)
      // Don't fail the org creation if member table doesn't exist
      console.log('Continuing without org_members table...')
    }
  } catch (error) {
    console.error('Exception adding user as admin:', error)
    // Don't fail the org creation
  }
  
  redirect(`/org/${org.slug}`)
}
