# Vercel Deployment Guide

This guide explains how to deploy the PulseAI feedback SaaS platform to Vercel.

## Project Structure

This is a **monorepo** with the Next.js app located in `apps/web/`. Vercel needs to be configured to build from this subdirectory.

## Option 1: Configure via Vercel Dashboard (Recommended)

### 1. Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### 2. Configure Build Settings

In the project settings, configure the following:

**Framework Preset:**
- Select: `Next.js`

**Root Directory:**
- Set to: `apps/web`
- ✅ Check "Include source files outside of the Root Directory in the Build Step"

**Build & Development Settings:**

**Framework Preset:**
- Should auto-detect as "Next.js" ✅
- If not, manually select "Next.js"

**Build Command:**
- **Option 1 (Recommended):** Leave as default - Vercel will use `next build`
- **Option 2 (Advanced):** Override with Turborepo:
  ```bash
  pnpm turbo run build --filter=@pulseai/web
  ```

**Output Directory:**
- Leave as default: `.next`

**Install Command:**
- Leave as default - Vercel auto-detects pnpm and installs from root

**Why defaults work:**
- Vercel detects pnpm workspace from `pnpm-workspace.yaml`
- Automatically installs all workspace dependencies
- Builds workspace packages before building web app
- No manual configuration needed!

### 3. Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key

**Optional:**
- `NEXT_PUBLIC_APP_URL` - Your production URL (auto-set by Vercel)

### 4. Deploy

Click **"Deploy"** and Vercel will build and deploy your app.

---

## Option 2: Use vercel.json (Alternative)

A `vercel.json` file has been included in the repository with the following configuration:

```json
{
  "buildCommand": "pnpm turbo run build --filter=@pulseai/web",
  "devCommand": "cd apps/web && pnpm dev",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/web/.next"
}
```

**However**, you still need to:
1. Set **Root Directory** to `apps/web` in Vercel Dashboard
2. Enable "Include source files outside of the Root Directory"
3. Add environment variables

---

## Monorepo Considerations

### Package Dependencies

The web app depends on local packages:
- `@pulseai/shared` - Shared types
- `@pulseai/worker` - AI analysis functions

Vercel's build process will:
1. Install all dependencies with pnpm
2. Build shared packages first
3. Build the web app

### Turborepo Integration

The project uses Turborepo for build orchestration. The build command:
```bash
pnpm turbo run build --filter=@pulseai/web
```

This ensures:
- Dependencies are built in the correct order
- Only necessary packages are rebuilt
- Build cache is utilized

---

## Troubleshooting

### Error: "No Next.js version detected"

**Cause:** Vercel is looking in the wrong directory.

**Solution:**
1. Set **Root Directory** to `apps/web` in Vercel Dashboard
2. Check "Include source files outside of Root Directory"

### Error: "Cannot find package @pulseai/shared"

**Cause:** Workspace dependencies not being resolved.

**Solution:**
1. Make sure Install Command is `pnpm install` (not npm or yarn)
2. Verify Build Command includes `cd ../..` to run from root
3. Check that "Include source files outside Root Directory" is enabled

### Error: "Build failed"

**Cause:** Dependencies might not be building in correct order.

**Solution:**
1. Use the Turborepo build command:
   ```bash
   cd ../.. && pnpm install && pnpm turbo run build --filter=@pulseai/web
   ```
2. Check build logs for specific package errors

### Environment Variables Not Working

**Cause:** Variables not set or incorrectly named.

**Solution:**
1. Verify all required env vars are set in Vercel Dashboard
2. Make sure they start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after adding new variables

---

## Post-Deployment Setup

### 1. Configure Supabase

After deployment:
1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```

### 2. Test Authentication

1. Visit your deployed app
2. Try signing up with email/password
3. Check that you receive verification email
4. Verify redirect works correctly

### 3. Test Widget SDK

Update the widget SDK default URL in `packages/widget/src/index.ts`:
```typescript
private defaultApiUrl = 'https://your-app.vercel.app';
```

Commit and push this change.

### 4. Database Migrations

Apply the database schema to your Supabase project:
1. Open Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Run the SQL script
4. Verify all tables and RLS policies are created

---

## Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Supabase redirect URLs added
- [ ] Database schema applied
- [ ] RLS policies tested
- [ ] Authentication flow tested
- [ ] Widget SDK tested on external site
- [ ] AI summarization tested (requires OpenAI API key)
- [ ] Organization creation tested
- [ ] Custom domain configured (optional)

---

## Custom Domain

To use a custom domain:

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as shown
4. Update environment variables if needed
5. Update Supabase redirect URLs

---

## Automatic Deployments

Vercel automatically deploys:
- **Production:** Pushes to `master` branch
- **Preview:** Pull requests and other branches

Each deployment gets a unique URL for testing.

---

## Performance Optimization

### Edge Functions

API routes in `apps/web/app/api/` automatically run on Vercel's Edge Network for low latency.

### Build Caching

Turborepo caches build outputs. Subsequent deployments are faster.

### Bundle Analysis

To analyze bundle size:
```bash
cd apps/web
pnpm build
```

Check `.next/analyze/` for bundle reports.

---

## Support

If you encounter issues:
1. Check Vercel build logs for specific errors
2. Review this deployment guide
3. Check Vercel's [monorepo documentation](https://vercel.com/docs/monorepos)
4. Verify all dependencies are listed in package.json files

---

## Example Vercel Settings Screenshot

```
Framework Preset: Next.js
Root Directory: apps/web ✅
Include source files outside Root Directory: ✅

Build Command: cd ../.. && pnpm install && pnpm turbo run build --filter=@pulseai/web
Output Directory: .next
Install Command: pnpm install
Development Command: pnpm dev

Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY
```

---

## Quick Deploy

For the fastest deployment (just 2 settings!):

1. **Root Directory:** Set to `apps/web`
2. **Include source files:** ✅ Check the box
3. **Add environment variables** (Supabase + OpenAI)
4. **Deploy**

That's it! Leave all other settings as default. Vercel auto-detects everything else.

