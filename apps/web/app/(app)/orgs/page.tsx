import { getServerSupabase } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { createOrg } from '@/app/actions/orgs'
import Link from 'next/link'

export default async function OrgsPage() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <main className="p-6">Please sign in.</main>

  // Use admin client to bypass RLS recursion issues
  const adminSupabase = getSupabaseAdmin()
  
  // Get user's organizations by checking org_members table
  const { data: memberships } = await (adminSupabase as any).from('org_members') // eslint-disable-line @typescript-eslint/no-explicit-any
    .select('org_id, role, organizations(id, name, slug, created_at)')
    .eq('user_id', user.id)

  const orgs = memberships?.map((m: any) => m.organizations).filter(Boolean) || [] // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <main className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Organizations</h1>
      <form action={createOrg} className="flex gap-2">
        <input name="name" placeholder="New org name" className="border rounded px-3 py-2 flex-1" required />
        <button className="border rounded px-3 py-2">Create</button>
      </form>
      <ul className="space-y-2">
        {(orgs ?? []).map((o: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <li key={o.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{o.name}</div>
              <div className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <Link className="underline" href={`/org/${o.slug ?? o.id}`}>Open</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
