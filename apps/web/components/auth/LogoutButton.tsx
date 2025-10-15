'use client'
import { useTransition } from 'react'
import { signOut } from '@/app/actions/logout'
export default function LogoutButton() {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => start(async () => { await signOut(); window.location.href = '/login' })}
      className="rounded-lg border px-3 py-2"
      disabled={pending}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
