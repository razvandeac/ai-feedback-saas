import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'

export default async function DashboardPage() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user.email}</p>
    </main>
  )
}
