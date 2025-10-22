import { getServerSupabase } from '@/lib/supabaseServer'
import { createOrg } from '@/app/actions/orgs'
import Link from 'next/link'

export default async function OrgsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <main className="p-6">Please sign in.</main>

  // Check if platform admin (DB-driven, audited)
  const { data: adminRow } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  const isPlatformAdmin = !!adminRow

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, created_at')
    .order('created_at', { ascending: false })

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'name-required': return 'Organization name is required.'
      case 'platform-admin-required': return 'Only platform admins can create organizations.'
      case 'create-failed': return 'Failed to create organization. Please try again.'
      default: return null
    }
  }

  const errorMessage = getErrorMessage(error)

  return (
    <main className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Organizations</h1>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {errorMessage}
        </div>
      )}

      {isPlatformAdmin ? (
        <form action={createOrg} className="flex gap-2">
          <input name="name" placeholder="New org name" className="border rounded px-3 py-2 flex-1" required />
          <button className="border rounded px-3 py-2">Create</button>
        </form>
      ) : (
        <p className="text-sm text-gray-600">Only platform admins can create new organizations.</p>
      )}

      <ul className="space-y-2">
        {(orgs ?? []).map(o => (
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
