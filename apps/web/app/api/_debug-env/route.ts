import { NextResponse } from 'next/server';

/**
 * Debug endpoint to verify environment variables are loaded
 * 
 * Visit: http://localhost:3000/api/_debug-env
 * 
 * Returns:
 * - Public env vars (safe to expose)
 * - Boolean flags for secret keys (not the actual values)
 * - Current working directory
 * 
 * ⚠️ Remove or protect this endpoint in production!
 */
export async function GET() {
  return NextResponse.json({
    // Public environment variables (safe to show)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
      : null,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? null,
    
    // Secret keys - only show if they're set (not the actual values)
    OPENAI_SET: Boolean(process.env.OPENAI_API_KEY),
    SERVICE_ROLE_SET: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    
    // Environment info
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
    
    // Timestamp
    timestamp: new Date().toISOString(),
  });
}

