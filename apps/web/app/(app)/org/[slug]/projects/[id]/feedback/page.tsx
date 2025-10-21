import { notFound } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'

export default async function ProjectFeedback({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: proj }, { data: rows, error }] = await Promise.all([
    supabase.from('projects').select('id, name, org_id').eq('id', id).single(),
    supabase
      .from('feedback')
      .select('id, created_at, rating, comment, metadata')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(200),
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
            {(rows ?? []).map((r: Record<string, unknown>) => {
              const meta = (r.metadata ?? {}) as Record<string, unknown>;
              return (
                <tr key={r.id as string} className="border-t">
                  <td className="px-3 py-2">{new Date(r.created_at as string).toLocaleString()}</td>
                  <td className="px-3 py-2">{String(r.rating ?? '-')}</td>
                  <td className="px-3 py-2">{String(r.comment ?? '-')}</td>
                  <td className="px-3 py-2">{String(meta.path ?? '-')}</td>
                  <td className="px-3 py-2 truncate max-w-[260px]">{String(meta.user_agent ?? '-')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
