import { NextResponse } from 'next/server'
import { parseEnvAllowed } from '@/lib/cors'

export async function GET() {
  const corsEnv = {
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    CORS_ALLOW_NO_ORIGIN: process.env.CORS_ALLOW_NO_ORIGIN,
    parsed_allowed_origins: parseEnvAllowed(),
    NODE_ENV: process.env.NODE_ENV
  }
  
  return NextResponse.json(corsEnv)
}
