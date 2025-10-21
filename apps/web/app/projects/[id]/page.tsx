import { notFound } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: proj, error } = await supabase
    .from('projects')
    .select('id, name, key, org_id')
    .eq('id', params.id)
    .single()

  if (!proj || error) notFound()

  return (
    <main className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">{proj.name}</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-medium mb-2">API Key</h2>
          <code className="text-sm bg-white p-2 rounded border block">{proj.key}</code>
        </div>
        
        <div className="flex gap-4">
          <Link 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
            href={`/projects/${proj.id}/feedback`}
          >
            View Feedback
          </Link>
        </div>
      </div>
    </main>
  )
}
