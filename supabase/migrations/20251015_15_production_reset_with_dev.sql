-- =====================================================
-- PRODUCTION DATABASE RESET WITH DEV DATA
-- Run this in production Supabase SQL Editor
-- =====================================================

-- STEP 1: Drop everything in production (WARNING: This deletes all data!)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Set proper ownership
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- STEP 2: Apply the dev schema
-- Copy and paste the entire content of dev_schema.sql here
-- (The file contains the complete schema from your working dev database)

-- STEP 3: Apply the dev data (optional)
-- Copy and paste the entire content of dev_data.sql here
-- (This will restore all your data from dev)

-- STEP 4: Test the function
SELECT 'Database reset complete' as status;

-- Test the get_users_lite function
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
