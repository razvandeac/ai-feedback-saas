'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { acceptInvite } from '@/app/actions/invites'

function AcceptInviteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [msg, setMsg] = useState('Validating invite…')
  useEffect(() => {
    const token = params.get('token')
    if (!token) { setMsg('Missing token'); return }
    ;(async () => {
      const res = await acceptInvite(token)
      if ('error' in res) { setMsg(res.error as string); return }
      setMsg('Invite accepted! Redirecting…'); router.replace('/dashboard')
    })()
  }, [params, router])
  return <main className="min-h-screen flex items-center justify-center p-6"><p>{msg}</p></main>
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center p-6"><p>Loading...</p></main>}>
      <AcceptInviteContent />
    </Suspense>
  )
}
