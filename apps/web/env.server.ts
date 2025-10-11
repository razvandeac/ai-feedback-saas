import { z } from 'zod';

/**
 * Server-side only environment variables
 * These are never exposed to the browser
 */
const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validated server-side environment variables
 * Only use in API routes and server components
 */
export const envServer = (() => {
  try {
    const parsed = serverEnvSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Warn if optional keys are missing
    if (!parsed.OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY not set - AI features will not work');
    }
    if (!parsed.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set - admin features may not work');
    }

    return parsed;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err: z.ZodIssue) => {
        return `  ❌ ${err.path.join('.')}: ${err.message}`;
      });

      console.error('\n⚠️  Server environment variable validation failed:\n');
      console.error(missingVars.join('\n'));
      console.error('\n📝 Please check your .env.local file in apps/web/\n');
    }

    throw error;
  }
})();

export type ServerEnv = z.infer<typeof serverEnvSchema>;

