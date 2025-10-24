import { notFound } from 'next/navigation'
import { getProjectWithWidget } from '@/src/server/projects/repo'

export default async function StudioPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params

  // Get project with widget information
  const proj = await getProjectWithWidget(id)
  if (!proj) notFound()

  // For now, disable studio until migration is applied
  // TODO: Re-enable studio operations after migration

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Widget Studio · {proj.name}</h1>
      
      {/* Studio disabled until migration is applied */}
      <div className="rounded-2xl border bg-amber-50 p-6 text-amber-800">
        <h2 className="text-lg font-semibold mb-2">Studio Temporarily Disabled</h2>
        <p className="text-sm mb-4">
          The Widget Studio is temporarily disabled until the database migration is applied.
        </p>
        <div className="text-sm">
          <p className="font-medium mb-2">To enable the Studio:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Apply the database migration: <code className="bg-amber-100 px-1 rounded">supabase/migrations/20251025_02_studio_widgets_safe.sql</code></li>
            <li>Restart the application</li>
            <li>Studio functionality will be restored</li>
          </ol>
        </div>
      </div>
    </main>
  )
}