import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import LogoutButton from '@/components/auth/LogoutButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await getServerSupabase()
  const adminSupabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Debug logging
  console.log('Dashboard auth check:', { user: user?.email, error })
  
  if (!user) {
    console.log('No user found, redirecting to login')
    redirect('/login')
  }

  // Fetch user's organizations using admin client
  const { data: memberships, error: membershipsError } = await (adminSupabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)

  console.log('Memberships query:', { memberships, membershipsError, userId: user.id })

  const orgIds = memberships?.map((m: any) => m.org_id) || [] // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log('Org IDs:', orgIds)
  
  // Get organization details using admin client
  const { data: organizations, error: orgsError } = await adminSupabase
    .from('organizations')
    .select('id, name, slug')
    .in('id', orgIds)
  
  console.log('Organizations query:', { organizations, orgsError })
  const orgs = organizations || []
  console.log('Final orgs array:', orgs)
  
  let totalProjects = 0
  let totalFeedback = 0
  let avgRating = null

  if (orgIds.length > 0) {
    // Get projects count using admin client
    const { count: projectsCount } = await adminSupabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('org_id', orgIds)
    
    totalProjects = projectsCount || 0

    // Get project IDs for feedback queries using admin client
    const { data: projects } = await adminSupabase
      .from('projects')
      .select('id')
      .in('org_id', orgIds)
    
    const projectIds = projects?.map(p => p.id) || []

    if (projectIds.length > 0) {
      // Get feedback count for last 7 days using admin client
      const since = new Date(Date.now() - 7*24*60*60*1000).toISOString()
      const { count: feedbackCount } = await adminSupabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since)
        .in('project_id', projectIds)
      
      totalFeedback = feedbackCount || 0

      // Get average rating using admin client
      const { data: ratings } = await adminSupabase
        .from('feedback')
        .select('rating')
        .not('rating', 'is', null)
        .in('project_id', projectIds)
        .limit(100)

      if (ratings && ratings.length > 0) {
        avgRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
      }
    }
  }

  // If user has organizations, redirect to the first one
  if (orgs.length > 0) {
    redirect(`/org/${orgs[0].slug}`)
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container-xl py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
              <p className="text-neutral-600 mt-1">Welcome back, {user.email}</p>
            </div>
            <LogoutButton />
          </div>

          {/* Debug info - remove this after fixing */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Info (Updated at {new Date().toLocaleTimeString()}):</h3>
            <p className="text-sm text-yellow-700">User ID: {user.id}</p>
            <p className="text-sm text-yellow-700">Memberships: {JSON.stringify(memberships)}</p>
            <p className="text-sm text-yellow-700">Org IDs: {JSON.stringify(orgIds)}</p>
            <p className="text-sm text-yellow-700">Organizations: {JSON.stringify(orgs)}</p>
            <p className="text-sm text-yellow-700">Orgs length: {orgs.length}</p>
            <p className="text-sm text-yellow-700">Build time: {new Date().toISOString()}</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
                Total Projects
              </div>
              <div className="text-3xl font-bold text-brand-900">{totalProjects}</div>
            </div>
            
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
                Feedback This Week
              </div>
              <div className="text-3xl font-bold text-brand-900">{totalFeedback}</div>
            </div>
            
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
                Average Rating
              </div>
              <div className="text-3xl font-bold text-brand-900">
                {avgRating ? avgRating.toFixed(2) : '—'}
              </div>
            </div>
          </div>

          {orgs.length > 0 ? (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Organizations</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {orgs.map((org) => (
                  <Link
                    key={org.id}
                    href={`/org/${org.slug}`}
                    className="p-4 rounded-2xl border border-neutral-200 hover:border-brand hover:bg-brand/5 transition-colors"
                  >
                    <div className="font-medium text-neutral-900">{org.name}</div>
                    <div className="text-sm text-neutral-600 mt-1">View organization →</div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Getting Started</h2>
              <p className="text-neutral-600 mb-4">
                Welcome to Vamoot! To start collecting feedback, you&apos;ll need to create an organization and add your first project.
              </p>
              <div className="flex gap-3">
                <Link href="/onboarding">
                  <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
                    Create Organization
                  </button>
                </Link>
                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
