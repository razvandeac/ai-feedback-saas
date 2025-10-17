'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    
    try {
      // Force OTP mode - use the most explicit approach
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          // Completely disable magic links
          emailRedirectTo: null
        }
      })
      
      if (error) {
        setError(error.message)
        return
      }
      
      setInfo('We sent you a 6-digit code.')
      setPhase('verify')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email'
      })
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      
      if (data.user) {
        console.log('OTP verification successful:', data.user.email)
        
        // Wait for session to be established
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('Session after OTP:', sessionData.session?.user?.email)
        
        setPhase('done')
        
        // Use window.location.href for a full page reload to ensure session is established
        setTimeout(() => {
          console.log('Redirecting to dashboard...')
          window.location.href = '/dashboard'
        }, 2000) // Increased timeout
      } else {
        console.log('No user in OTP response')
        setError('Authentication failed. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  async function resendOtp() {
    setLoading(true); setError(null); setInfo(null)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined
        }
      })
      
      setLoading(false)
      if (error) { 
        setError(error.message)
        return 
      }
      setInfo('We sent you a new 6-digit code.')
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Failed to resend code. Please try again.')
      setLoading(false)
    }
  }

  if (phase === 'done') {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl border border-neutral-200 bg-white shadow-soft">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">You&apos;re in</h2>
          <p className="text-neutral-600">Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl border border-neutral-200 bg-white shadow-soft">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome to Vamoot</h1>
        <p className="text-neutral-600">Sign in with a one-time code</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-4 p-3 rounded-2xl bg-brand/5 border border-brand/20 text-brand-700 text-sm">
          {info}
        </div>
      )}

      {phase === 'request' && (
        <form onSubmit={requestOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send code'}
          </Button>
        </form>
      )}

      {phase === 'verify' && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              6-digit code
            </label>
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              className="w-full text-center text-lg tracking-widest"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoComplete="one-time-code"
              placeholder="123456"
            />
            <p className="text-xs text-neutral-500 mt-1 text-center">
              Check your email for the verification code
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & continue'}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-sm" 
            onClick={resendOtp}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Resend code'}
          </Button>
        </form>
      )}
    </div>
  )
}
