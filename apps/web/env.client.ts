import { z } from 'zod';

/**
 * Client-side environment variables
 * These are exposed to the browser and embedded in the JavaScript bundle
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL',
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
  }),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url({
      message: 'NEXT_PUBLIC_APP_URL must be a valid URL',
    })
    .default('http://localhost:3000'),
});

/**
 * Validated client-side environment variables
 * Safe to use in browser/client components
 */
export const env = (() => {
  // During build time, provide safe defaults to allow build to complete
  const isBuildTime = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (isBuildTime) {
    console.warn('\n⚠️  Building without client environment variables - using placeholders');
    console.warn('⚠️  Make sure to set environment variables in Vercel dashboard or apps/web/.env.local\n');

    return {
      NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    };
  }

  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err: z.ZodIssue) => {
        return `  ❌ ${err.path.join('.')}: ${err.message}`;
      });

      console.error('\n⚠️  Client environment variable validation failed:\n');
      console.error(missingVars.join('\n'));
      console.error('\n📝 Please check your .env.local file in apps/web/\n');
    }

    throw error;
  }
})();

export type ClientEnv = z.infer<typeof clientEnvSchema>;

