'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Phase = 'request' | 'verify' | 'done'

export default function OtpLogin() {
  const [phase, setPhase] = useState<Phase>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setInfo(null)
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (error) { setError(error.message); return }
    setInfo('We sent you a 6-digit code.')
    setPhase('verify')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email'
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setPhase('done')
    window.location.href = '/dashboard'
  }

  if (phase === 'done') {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl border">
        <h2 className="text-xl font-semibold">You&apos;re in</h2>
        <p>Redirecting to your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-4">Sign in with a one-time code</h2>

      {error && <div className="mb-3 text-red-600">{error}</div>}
      {info && <div className="mb-3 text-green-700">{info}</div>}

      {phase === 'request' && (
        <form onSubmit={requestOtp} className="space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <button type="submit" className="w-full rounded-lg border px-4 py-2" disabled={loading}>
            {loading ? 'Sending…' : 'Send code'}
          </button>
        </form>
      )}

      {phase === 'verify' && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <label className="block">
            <span className="text-sm">6-digit code</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              className="mt-1 w-full rounded-lg border p-2 tracking-widest"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoComplete="one-time-code"
            />
          </label>
          <button type="submit" className="w-full rounded-lg border px-4 py-2" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & continue'}
          </button>
          <button type="button" className="w-full text-sm underline mt-2" onClick={() => setPhase('request')}>
            Resend code
          </button>
        </form>
      )}
    </div>
  )
}
