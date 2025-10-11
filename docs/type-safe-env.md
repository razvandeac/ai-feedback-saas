# Type-Safe Environment Variables with Zod

This project uses Zod for runtime validation and type-safe access to environment variables.

## Overview

Instead of accessing `process.env` directly (which can be undefined and has no type safety), we use a validated `env` object that:

1. ✅ Validates all required variables exist
2. ✅ Validates values are correct format (URLs, enums, etc.)
3. ✅ Provides TypeScript autocomplete
4. ✅ Shows clear error messages if something is wrong
5. ✅ Allows builds without env vars (uses placeholders)

## File Structure

```
apps/web/
└── env.ts              ← Zod validation schema and exported env object
```

## Usage

### In Web App (Next.js)

```typescript
// Import the validated env object
import { env } from '@/env';

// Use with full type safety
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL; // string (validated URL)
const openaiKey = env.OPENAI_API_KEY;            // string
const nodeEnv = env.NODE_ENV;                     // "development" | "production" | "test"
```

### Examples

**In API Routes:**

```typescript
// apps/web/app/api/ai/summarize/route.ts
import { env } from '@/env';

export async function POST(request: Request) {
  // env.OPENAI_API_KEY is guaranteed to exist and be a valid string
  const result = await summarizeFeedback(feedback, env.OPENAI_API_KEY);
  return NextResponse.json({ result });
}
```

**In Supabase Client:**

```typescript
// apps/web/lib/supabaseClient.ts
import { env } from '../env';

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**In React Components:**

```typescript
// apps/web/app/some-component.tsx
import { env } from '@/env';

function MyComponent() {
  console.log('App URL:', env.NEXT_PUBLIC_APP_URL);
  // ...
}
```

## Validation Schema

The schema is defined in `apps/web/env.ts`:

```typescript
const envSchema = z.object({
  // Supabase - Public (client-side)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL',
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
  }),

  // Supabase - Server-only (optional)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // OpenAI - Server-only
  OPENAI_API_KEY: z.string().min(1, {
    message: 'OPENAI_API_KEY is required for AI features',
  }),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});
```

## Error Handling

### Development (Missing Env Vars)

When you start the dev server without required variables:

```
⚠️  Environment variable validation failed:

  ❌ NEXT_PUBLIC_SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL must be a valid URL
  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: NEXT_PUBLIC_SUPABASE_ANON_KEY is required
  ❌ OPENAI_API_KEY: OPENAI_API_KEY is required for AI features

📝 Please check your .env file in the repo root

💡 Tip: Copy ENV_EXAMPLE.txt and fill in your values
```

**The error is clear and actionable!**

### Build Time (CI/CD)

During builds without env vars (like in CI):

```
⚠️  Building without environment variables - using placeholders
⚠️  Make sure to set environment variables in Vercel dashboard
```

The build completes using placeholder values, but warns you to set them in production.

## Adding New Environment Variables

### Step 1: Update Schema

Edit `apps/web/env.ts`:

```typescript
const envSchema = z.object({
  // ... existing vars
  
  // Add your new variable
  MY_NEW_API_KEY: z.string().min(1, {
    message: 'MY_NEW_API_KEY is required',
  }),
});
```

### Step 2: Add to .env

Edit `.env` in repo root:

```bash
MY_NEW_API_KEY=my-secret-key
```

### Step 3: Use Safely

```typescript
import { env } from '@/env';

const apiKey = env.MY_NEW_API_KEY; // Fully typed, validated
```

### Step 4: Update ENV_EXAMPLE.txt

Add documentation:

```bash
# My New Service
MY_NEW_API_KEY=your-key-here
```

## Advanced Validation

### URL Validation

```typescript
NEXT_PUBLIC_API_URL: z.string().url(), // Must be valid URL
```

### Enum Validation

```typescript
LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
```

### Number Validation

```typescript
MAX_RETRIES: z.string().transform(Number).pipe(z.number().min(1).max(10)),
```

### Conditional Validation

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  ANALYTICS_KEY: z.string().optional(),
}).refine(
  (env) => env.NODE_ENV !== 'production' || env.ANALYTICS_KEY,
  'ANALYTICS_KEY is required in production'
);
```

## Worker Package

The worker package also handles env vars safely:

```typescript
// packages/worker/src/index.ts
import { config } from 'dotenv';
config(); // Load .env for local dev

export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  return apiKey;
}
```

## Best Practices

### ✅ DO:

```typescript
// Use the validated env object
import { env } from '@/env';
const url = env.NEXT_PUBLIC_SUPABASE_URL;

// Add validation rules
API_KEY: z.string().min(20, 'API key too short')

// Use defaults for optional vars
TIMEOUT: z.string().transform(Number).default('5000')
```

### ❌ DON'T:

```typescript
// Don't use process.env directly
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // Not validated, could be undefined

// Don't use non-null assertions
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Unsafe

// Don't skip validation
const key = process.env.OPENAI_API_KEY || 'fallback'; // Not type-safe
```

## TypeScript Benefits

With the validated `env` object, you get:

```typescript
import { env } from '@/env';

// Full autocomplete
env.NEXT_PUBLIC_  // TypeScript suggests: SUPABASE_URL, SUPABASE_ANON_KEY, APP_URL

// Type checking
const mode: string = env.NODE_ENV;  // ✅ Works
const mode: number = env.NODE_ENV;  // ❌ Type error

// Guaranteed existence
env.OPENAI_API_KEY.startsWith('sk-');  // ✅ Safe - will never be undefined
process.env.OPENAI_API_KEY.startsWith('sk-');  // ❌ Error - might be undefined
```

## Summary

✅ **Type-safe** environment variables with Zod validation  
✅ **Clear error messages** when variables are missing  
✅ **Runtime validation** prevents runtime errors  
✅ **Build-time flexibility** allows builds without env vars  
✅ **Developer experience** with autocomplete and type checking  

Import `env` from `@/env` and enjoy type-safe environment access throughout your app!

