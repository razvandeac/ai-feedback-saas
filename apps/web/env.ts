import { z } from 'zod';

/**
 * Environment variable validation schema
 * 
 * This ensures all required environment variables are present and valid
 * before the application starts. Provides clear error messages if anything is missing.
 */
const envSchema = z.object({
  // Supabase - Public (client-side)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL',
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
  }),

  // Supabase - Server-only (optional for now, some features may need it)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // OpenAI - Server-only
  OPENAI_API_KEY: z.string().min(1, {
    message: 'OPENAI_API_KEY is required for AI features',
  }),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url({
      message: 'NEXT_PUBLIC_APP_URL must be a valid URL',
    })
    .default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validated environment variables
 * 
 * Import this to access type-safe, validated environment variables:
 * 
 * @example
 * import { env } from '@/env';
 * 
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
 * const openaiKey = env.OPENAI_API_KEY;
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err: z.ZodIssue) => {
        return `  ❌ ${err.path.join('.')}: ${err.message}`;
      });

      console.error('\n⚠️  Environment variable validation failed:\n');
      console.error(missingVars.join('\n'));
      console.error('\n📝 Please check your .env.local file in apps/web/\n');
      console.error('💡 Tip: Copy .env.example from the repo root and fill in your values\n');
    }

    // At build time without env vars, use placeholders to allow build to complete
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('⚠️  Building without environment variables - using placeholders');
      console.warn('⚠️  Make sure to set environment variables in Vercel dashboard');
      
      return {
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key',
        SUPABASE_SERVICE_ROLE_KEY: undefined,
        OPENAI_API_KEY: 'placeholder-key',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NODE_ENV: 'production' as const,
      };
    }

    throw error;
  }
})();

/**
 * Type-safe environment variables
 * Use this type for components/functions that need env vars
 */
export type Env = z.infer<typeof envSchema>;

