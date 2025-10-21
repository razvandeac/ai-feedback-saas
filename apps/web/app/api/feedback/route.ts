import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/** Adjust when you know embed origins; for now keep permissive during MVP */
const ALLOW_ORIGINS = ['*'] // later: ['https://yourapp.com', 'https://client.com']

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') ?? '*'
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOW_ORIGINS.includes('*') ? '*' : (ALLOW_ORIGINS.includes(origin) ? origin : ''),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Project-Key',
      'Access-Control-Max-Age': '600',
    },
  })
}

// naive in-memory rate limit (per runtime instance)
const hits = new Map<string, { c: number; t: number }>()
function limited(ip: string, windowMs = 60_000, max = 30) {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now - rec.t > windowMs) { hits.set(ip, { c: 1, t: now }); return false }
  rec.c += 1; return rec.c > max
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? '*'
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOW_ORIGINS.includes('*') ? '*' : (ALLOW_ORIGINS.includes(origin) ? origin : ''),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Project-Key',
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: corsHeaders })
  }

  const key = req.headers.get('x-project-key') || ''
  if (!key) return NextResponse.json({ error: 'missing_project_key' }, { status: 401, headers: corsHeaders })

  const supabase = getSupabaseAdmin()

  // 1) validate project key
  const { data: proj, error: perr } = await supabase
    .from('projects')
    .select('id, org_id')
    .eq('key', key)
    .single()

  if (perr || !proj) {
    return NextResponse.json({ error: 'invalid_project_key' }, { status: 401, headers: corsHeaders })
  }

  // 2) parse payload
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: corsHeaders }) }

  const { rating = null, comment = null, path = null, user_agent = null } = body ?? {}

  // 3) insert feedback row (anonymous insert). RLS must allow this form of insert (see SQL note below).
  const { data, error } = await supabase
    .from('feedback')
    .insert([{
      org_id: proj.org_id,
      project_id: proj.id,
      rating,
      comment,
      metadata: {
        path: path,
        user_agent: user_agent ?? req.headers.get('user-agent') ?? null
      }
    }] as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .select('id, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
  }

  return NextResponse.json({ ok: true, id: data.id, created_at: data.created_at }, { status: 201, headers: corsHeaders })
}
