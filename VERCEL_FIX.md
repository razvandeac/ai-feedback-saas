# 🚨 URGENT: Fix Vercel "No Next.js version detected" Error

## The Problem

Vercel is looking for `next` in the root `package.json`, but it's in `apps/web/package.json` because this is a **monorepo**.

## ✅ THE FIX (Required - Do This Now!)

You **MUST** configure the Root Directory in Vercel Dashboard. The `vercel.json` file is NOT enough for monorepos.

### Step-by-Step Instructions:

#### 1. Go to Vercel Dashboard
- Open your project at: https://vercel.com/dashboard
- Click on your project name

#### 2. Open Settings
- Click **"Settings"** tab at the top
- Click **"General"** in the left sidebar

#### 3. Configure Root Directory
Scroll down to **"Root Directory"** section:

**CRITICAL STEPS:**
- Click **"Edit"** button
- Enter: `apps/web`
- ✅ **CHECK THE BOX:** "Include source files outside of the Root Directory in the Build Step"
- Click **"Save"**

![Root Directory Setting](https://i.imgur.com/example.png)

#### 4. Build Settings (Use Defaults or vercel.json)

**Option 1 - Use vercel.json (Recommended):**
- The `apps/web/vercel.json` file is already configured
- Vercel will automatically use it once Root Directory is set
- No need to override any settings in the dashboard

**Option 2 - Manual Override:**
- **Framework Preset:** Next.js
- **Build Command:** `pnpm turbo run build --filter=@pulseai/web`
- **Output Directory:** `.next`
- **Install Command:** `pnpm install`

The `apps/web/vercel.json` provides these settings automatically.

#### 5. Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=sk-your-openai-api-key
```

#### 6. Redeploy

- Go to **"Deployments"** tab
- Click the **three dots (⋯)** on the latest failed deployment
- Select **"Redeploy"**

---

## Why This Happens

### Monorepo Structure:
```
ai-feedback-saas/                 ← Root (no Next.js here)
├── package.json                  ← No "next" dependency
├── apps/
│   └── web/
│       ├── package.json          ← HAS "next" dependency ✓
│       └── app/
└── packages/
```

**Vercel by default looks in the root directory** and doesn't find Next.js, hence the error.

---

## Alternative: Redeploy with Vercel CLI

If you prefer using the CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with correct settings
cd apps/web
vercel --prod
```

---

## Verification

After making these changes, your next deployment should show:

```
✓ Installing dependencies...
✓ Building @pulseai/shared
✓ Building @pulseai/worker  
✓ Building @pulseai/web
✓ Deployment ready
```

---

## Still Having Issues?

### Check These:

1. **Root Directory is set to `apps/web`** ← Most common issue!
2. **"Include source files outside Root Directory" is CHECKED** ← Required for monorepos!
3. **Environment variables are set** (especially SUPABASE vars)
4. **Build command includes workspace setup:**
   ```bash
   cd ../.. && pnpm turbo run build --filter=@pulseai/web
   ```

### Debug in Vercel Logs:

Look for:
```
Error: No Next.js version detected
```

If you see this, the Root Directory is NOT set correctly.

Should see:
```
Detected Next.js version: 15.0.2
```

---

## Screenshot Guide

### Correct Root Directory Configuration:

```
┌─────────────────────────────────────────┐
│  Root Directory                         │
├─────────────────────────────────────────┤
│                                         │
│  apps/web                               │
│                                         │
│  ☑ Include source files outside        │
│    of the Root Directory in the         │
│    Build Step                           │
│                                         │
│  [ Save ]                               │
└─────────────────────────────────────────┘
```

---

## Success!

Once configured correctly, your app will deploy at:
```
https://your-project.vercel.app
```

And automatic deployments will work for every push to `master`.

---

## Need More Help?

1. Read `VERCEL_DEPLOYMENT.md` for full details
2. Check Vercel's monorepo docs: https://vercel.com/docs/monorepos
3. Review deployment logs in Vercel dashboard

