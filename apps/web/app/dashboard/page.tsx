import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function DashboardPage() {
  const supabase = await getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Debug logging
  console.log('Dashboard auth check:', { user: user?.email, error })
  
  if (!user) {
    console.log('No user found, redirecting to login')
    redirect('/login')
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
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
                Total Projects
              </div>
              <div className="text-3xl font-bold text-brand-900">0</div>
            </div>
            
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
                Feedback This Week
              </div>
              <div className="text-3xl font-bold text-brand-900">0</div>
            </div>
            
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
                Average Rating
              </div>
              <div className="text-3xl font-bold text-brand-900">—</div>
            </div>
          </div>
          
          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Getting Started</h2>
            <p className="text-neutral-600 mb-4">
              Welcome to Vamoot! To start collecting feedback, you&apos;ll need to create an organization and add your first project.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
                Create Organization
              </button>
              <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
