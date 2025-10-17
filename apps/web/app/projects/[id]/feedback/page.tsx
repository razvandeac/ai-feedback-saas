import { notFound } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'

export default async function ProjectFeedback({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: proj }, { data: rows, error }] = await Promise.all([
    supabase.from('projects').select('id, name, org_id').eq('id', params.id).single(),
    supabase.from('feedback')
      .select('id, created_at, rating, comment, path, user_agent')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })
      .limit(200)
  ])

  if (!proj || error) notFound()

  return (
    <main className="p-6 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Feedback · {proj.name}</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Rating</th>
              <th className="px-3 py-2 text-left">Comment</th>
              <th className="px-3 py-2 text-left">Path</th>
              <th className="px-3 py-2 text-left">UA</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{r.rating ?? '-'}</td>
                <td className="px-3 py-2">{r.comment ?? '-'}</td>
                <td className="px-3 py-2">{r.path ?? '-'}</td>
                <td className="px-3 py-2 truncate max-w-[260px]">{r.user_agent ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
