import { notFound } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { regenProjectKey } from '@/app/actions/projects'

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getServerSupabase()
  const adminSupabase = getSupabaseAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Use admin client to bypass RLS issues
  const { data: proj } = await adminSupabase
    .from('projects')
    .select('id, name, key, org_id')
    .eq('id', id)
    .single()
  if (!proj) notFound()

  async function regenerate() {
    'use server'
    await regenProjectKey(id)
  }

  return (
    <main className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">{proj.name}</h1>
      <section className="rounded-xl border p-4 space-y-3">
        <h2 className="font-medium">Project API Key</h2>
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 rounded bg-gray-50 border">{proj.key}</code>
          <form action={regenerate}><button className="border rounded px-2 py-1">Regenerate</button></form>
          <button
            className="border rounded px-2 py-1"
            onClick={async () => { await navigator.clipboard.writeText(proj.key); alert('Copied') }}
          >Copy</button>
        </div>
      </section>
      <a className="underline" href={`/org/demo/projects/${proj.id}/feedback`}>View Feedback</a>
    </main>
  )
}
