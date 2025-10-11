# Quick Start Guide

Get PulseAI running locally in 5 minutes!

## Prerequisites

- Node.js 18+ (use `nvm use --lts`)
- pnpm 8+
- Supabase account (free tier works)
- OpenAI API key (optional for AI features)

---

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-feedback-saas

# Use latest Node LTS
nvm use --lts

# Install all dependencies
pnpm install
```

---

## 2. Set Up Environment Variables

### Create .env File

**For development, create `.env` in apps/web/:**

```bash
# Navigate to web app
cd apps/web

# Create .env file
cat > .env << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF
```

### Get Your Credentials

**Supabase:**
1. Go to https://app.supabase.com/
2. Create a new project (or select existing)
3. Go to **Settings** → **API**
4. Copy these values to your `.env`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Click **"+ Create new secret key"**
3. Copy the key → `OPENAI_API_KEY`

---

## 3. Set Up Supabase Database

### Apply the Schema

1. Open **Supabase SQL Editor** in your project dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. Verify tables are created: orgs, members, projects, flows, feedback

**Tables created:**
- ✅ orgs
- ✅ members
- ✅ projects
- ✅ flows
- ✅ feedback

**Features enabled:**
- ✅ Row Level Security (RLS)
- ✅ Helper functions for permissions
- ✅ Cascade deletes
- ✅ Automatic timestamps

---

## 4. Start Development Server

```bash
pnpm dev
```

This starts:
- Next.js dev server at http://localhost:3000
- TypeScript watch mode for all packages
- Hot reload enabled

---

## 5. Test the App

### Authentication

1. Open http://localhost:3000/login
2. Click **"Sign up"**
3. Create an account with email/password
4. You'll be redirected to the dashboard

### Create an Organization

1. In the dashboard, scroll to **"Your Organizations"**
2. Click **"+ New Organization"**
3. Enter a name (e.g., "Acme Corp")
4. Click **"Create Organization"**
5. You'll see it listed with your "owner" role

### Test AI Summarization

1. Scroll to **"AI Feedback Summarizer"**
2. Click **"Example 1"** to load sample feedback
3. Click **"🤖 Summarize with AI"**
4. Wait 2-5 seconds
5. See the AI-generated summary and sentiment!

### Test Widget SDK

1. Visit http://localhost:3000/widget-demo
2. Click the example buttons to send feedback
3. Check the status messages

---

## 6. Verify Everything Works

Run through this checklist:

- [ ] Dev server starts without errors
- [ ] Can sign up and log in
- [ ] Can create organizations
- [ ] AI summarizer returns results
- [ ] No console errors in browser
- [ ] Widget demo sends feedback successfully

---

## Environment Validation

The app uses **Zod** to validate environment variables on startup.

If you see this error:
```
⚠️  Environment variable validation failed:
  ❌ NEXT_PUBLIC_SUPABASE_URL: Required
  ❌ OPENAI_API_KEY: Required
```

**Fix:**
1. Make sure `.env` file exists in repo root
2. Check variable names are exact
3. Verify all required variables have values
4. Restart dev server

---

## Build for Production

```bash
pnpm turbo run build
```

Expected output:
```
✓ Building @pulseai/shared
✓ Building @pulseai/worker  
✓ Building @pulseai/web
✓ Build completed
```

---

## Troubleshooting

### "Cannot find module 'zod'"

```bash
pnpm install
```

### "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"

1. Check `.env` file exists in repo root
2. Restart dev server
3. Clear Next.js cache: `rm -rf apps/web/.next`

### Build works but app crashes

- Check `.env` variables are correct
- Verify Supabase URL is reachable
- Test OpenAI API key is valid

### Supabase schema errors

- Make sure you ran `supabase/schema.sql`
- Check RLS policies are enabled
- Verify all tables exist

---

## Project Structure

```
ai-feedback-saas/
├── .env                    ← Your local environment variables
├── .env.example           ← Template (commit this)
├── apps/
│   └── web/
│       ├── env.ts         ← Zod validation (type-safe env)
│       ├── app/
│       └── lib/
├── packages/
│   ├── shared/            ← Types
│   ├── worker/            ← AI functions
│   └── widget/            ← SDK
└── supabase/
    └── schema.sql         ← Database schema
```

---

## Next Steps

After getting it running locally:

1. **Deploy to Vercel** - See `VERCEL_DEPLOYMENT.md`
2. **Customize branding** - Update colors, logo, text
3. **Add features** - Projects UI, feedback viewing, etc.
4. **Invite team members** - Use the members table

---

## Useful Commands

```bash
# Start dev server
pnpm dev

# Build all packages
pnpm build

# Build specific package
pnpm --filter @pulseai/web build

# Clean all builds
pnpm turbo run clean

# Lint code
pnpm lint

# Install dependencies
pnpm install
```

---

## Support

- 📚 **Full Documentation:** See `ENVIRONMENT_SETUP.md`
- 🚀 **Deployment:** See `VERCEL_DEPLOYMENT.md`
- 🔧 **Build Issues:** See `BUILD_NOTES.md`
- 🐛 **Report Issues:** GitHub Issues

---

That's it! You should now have PulseAI running locally. 🎉

Next: Visit http://localhost:3000 and start exploring!

