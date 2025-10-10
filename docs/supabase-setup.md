# Supabase Setup Guide

## Steps to Set Up Your Supabase Database

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ai-feedback-saas` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local` in the `apps/frontend` directory:
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

2. Update `apps/frontend/.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   HMAC_SECRET=your-random-secret-key
   ```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

### 5. Seed Initial Data

1. In the SQL Editor, copy the contents of `supabase/seed.sql`
2. Paste it into the SQL Editor
3. Click **Run** to insert the dev organization
4. **Important**: Copy the returned `id` from the first query
5. Update the second query with the copied `org_id`:
   ```sql
   insert into projects (org_id, name) values ('<PASTE_ORG_ID_HERE>', 'Dev Project') returning id;
   ```
6. Run the updated query to create the dev project
7. **Save the project ID** - you'll need it for development

### 6. Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three tables:
   - `orgs` - with your dev organization
   - `projects` - with your dev project
   - `feedback` - empty but ready for data

### 7. Row Level Security (RLS)

The schema enables RLS on all tables. You'll need to create policies based on your authentication requirements:

- **For development**: You might want to temporarily disable RLS or create permissive policies
- **For production**: Create proper policies based on user authentication

### Next Steps

- Set up authentication (if needed)
- Create RLS policies
- Start building your application with the configured database

## Troubleshooting

- **Connection issues**: Double-check your environment variables
- **Permission errors**: Check RLS policies in Supabase dashboard
- **Schema errors**: Ensure you ran the schema.sql completely before seeding
