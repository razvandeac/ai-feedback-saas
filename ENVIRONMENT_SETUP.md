# Environment Variables Setup Guide

This guide explains how to set up environment variables for local development and production deployment.

## Local Development

### 1. Create Environment File

Create a file named `.env.local` in the `apps/web/` directory:

```bash
cd apps/web
touch .env.local
```

### 2. Add Environment Variables

Open `apps/web/.env.local` and add the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Your Supabase Credentials

1. **Go to your Supabase project:** https://app.supabase.com/
2. **Select your project**
3. **Click on Settings (gear icon) → API**
4. **Copy the values:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Example:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Get Your OpenAI API Key

1. **Go to OpenAI:** https://platform.openai.com/api-keys
2. **Sign in or create an account**
3. **Click "+ Create new secret key"**
4. **Copy the key** (starts with `sk-`)
5. **Add to `.env.local`:**

```bash
OPENAI_API_KEY=sk-proj-abcdef123456...
```

### 5. Verify Setup

After adding all variables, restart your dev server:

```bash
cd apps/web
pnpm dev
```

Check the terminal - you should NOT see any environment variable warnings.

---

## Quick Setup Script

Run this from the project root:

```bash
# Navigate to web app
cd apps/web

# Create .env.local file
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ .env.local created! Now edit it with your actual values."
```

Then edit the file:
```bash
nano .env.local
# or
code .env.local
# or
vim .env.local
```

---

## Environment Variable Types

### `NEXT_PUBLIC_*` Variables

**Used for:** Client-side JavaScript (browser)

**Rules:**
- Must start with `NEXT_PUBLIC_`
- Exposed to the browser
- Can be accessed in React components
- Embedded in the JavaScript bundle

**Example:**
```typescript
// This works in React components
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### Server-Only Variables

**Used for:** Server-side code only (API routes, server components)

**Rules:**
- Do NOT start with `NEXT_PUBLIC_`
- Only accessible in server-side code
- Never exposed to the browser
- More secure for sensitive keys

**Example:**
```typescript
// Only works in API routes or server components
const apiKey = process.env.OPENAI_API_KEY;
```

---

## Required Variables

### For Authentication to Work

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Used by:**
- Login/signup functionality
- Session management
- All authenticated API calls

**Test:**
- Visit `/login` and try to sign up
- If you get errors, check browser console for Supabase errors

### For AI Features to Work

```bash
OPENAI_API_KEY=sk-proj-...
```

**Used by:**
- `/api/ai/summarize` endpoint
- AI feedback analysis

**Test:**
- Go to `/dashboard` and scroll to AI Summarizer
- Click "Summarize with AI"
- Should return summary and sentiment

---

## Optional Variables

### Custom App URL

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Used for:**
- Redirect URLs
- Widget SDK default URL
- OAuth callbacks

**Default:** Falls back to `http://localhost:3000` in development

---

## Multiple Environments

### Development (.env.local)

```bash
# Local development
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-key...
OPENAI_API_KEY=sk-dev-key...
```

### Staging (.env.staging)

```bash
# Staging environment
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key...
OPENAI_API_KEY=sk-staging-key...
```

Load with:
```bash
cp .env.staging .env.local
pnpm dev
```

---

## Production (Vercel)

Add variables in **Vercel Dashboard → Settings → Environment Variables**:

### For Production Environment

| Variable Name | Value | Scope |
|---------------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://prod.supabase.co | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | Production |
| `OPENAI_API_KEY` | sk-... | Production |

### For Preview Deployments (Optional)

Same variables but with scope set to "Preview" if you want different values for PR previews.

---

## Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already configured)
- Use separate keys for dev/staging/prod
- Store production keys only in Vercel dashboard
- Rotate keys periodically

### ❌ DON'T:
- Commit `.env.local` to git
- Share API keys in public repos
- Use production keys in development
- Expose service role keys (only use anon key)

---

## Troubleshooting

### "Missing environment variable" error in browser

**Cause:** Env vars not loaded or wrong name

**Fix:**
1. Check `.env.local` exists in `apps/web/`
2. Verify variable names start with `NEXT_PUBLIC_` for client-side
3. Restart dev server: `pnpm dev`
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

### Environment variables not updating

**Cause:** Next.js caches env vars

**Fix:**
```bash
# Stop the dev server
# Edit .env.local
# Delete .next folder
rm -rf apps/web/.next

# Restart dev server
cd apps/web
pnpm dev
```

### API key not working

**Cause:** Invalid or expired key

**Fix:**
1. Verify key in Supabase/OpenAI dashboard
2. Regenerate if needed
3. Update `.env.local`
4. Restart dev server

---

## Verification Checklist

After setting up environment variables:

- [ ] Created `apps/web/.env.local` file
- [ ] Added all required variables
- [ ] Restarted dev server
- [ ] No environment warnings in terminal
- [ ] Can sign up/login at `/login`
- [ ] Can view dashboard at `/dashboard`
- [ ] AI summarizer works (if OpenAI key added)
- [ ] No errors in browser console

---

## Quick Test

```bash
# Check if env vars are loaded
cd apps/web
pnpm dev

# In another terminal
curl http://localhost:3000/api/ai/summarize/
```

Should return API information (not an error about missing env vars).

---

## Example .env.local

Here's a complete example:

```bash
# ============================================
# Supabase Configuration
# ============================================
# Get from: https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5MDAwMDAwMCwiZXhwIjoyMDA1NTc2MDAwfQ.example-signature

# ============================================
# OpenAI Configuration
# ============================================
# Get from: https://platform.openai.com/api-keys

OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# ============================================
# App Configuration (Optional)
# ============================================

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## File Location

```
ai-feedback-saas/
├── apps/
│   └── web/
│       ├── .env.local          ← Create this file here
│       ├── .env.local.example  ← Reference template (committed to git)
│       ├── app/
│       └── package.json
└── ...
```

**Important:** The `.env.local` file goes in `apps/web/`, NOT in the project root!

---

## Next Steps

1. Create `apps/web/.env.local` with your actual credentials
2. Restart dev server
3. Test authentication at `/login`
4. Test AI features in `/dashboard`
5. Deploy to Vercel with production env vars

That's it! Your local development environment is ready. 🎉

