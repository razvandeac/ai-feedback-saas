'use server'
import { Resend } from 'resend'
import { getRouteSupabase } from '@/lib/supabaseServer'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and RESEND_FROM environment variables are required')
  }
  return new Resend(apiKey)
}

export async function createInvite(formData: FormData) {
  const orgId = String(formData.get('org_id') ?? '')
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('role') ?? 'member') === 'admin' ? 'admin' : 'member'
  if (!orgId || !email) return

  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const token = Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,10)
  const { error } = await supabase.from('invites').insert({ org_id: orgId, email, role, token })
  if (error) return

  const base = process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'http://localhost:3000'
  const url = `${base}/invite?token=${encodeURIComponent(token)}`
  
  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: email,
      subject: 'You\'re invited to Vamoot',
      html: `<p>You've been invited to join an organization on Vamoot.</p><p><a href="${url}">Accept invite</a> (valid 7 days)</p>`
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    // Don't fail the invite creation if email fails
  }
}

export async function acceptInvite(token: string) {
  const supabase = await getRouteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in first' }

  const { data: inv, error } = await supabase
    .from('invites')
    .select('id, org_id, email, role, expires_at, accepted_at')
    .eq('token', token).is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  if (error || !inv) return { error: 'Invalid or expired invite' }

  const { error: merr } = await supabase.from('org_members').upsert({
    org_id: inv.org_id,
    user_id: user.id,
    role: inv.role
  })
  if (merr) return { error: merr.message }

  await supabase.from('invites').update({ accepted_at: new Date().toISOString() }).eq('id', inv.id)
  return { ok: true, org_id: inv.org_id }
}
