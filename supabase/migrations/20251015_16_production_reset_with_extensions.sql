-- =====================================================
-- PRODUCTION DATABASE RESET WITH EXTENSIONS
-- Run this FIRST in production Supabase SQL Editor
-- =====================================================

-- STEP 1: Drop everything in production (WARNING: This deletes all data!)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Set proper ownership
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- STEP 2: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STEP 3: Now apply the dev schema
-- Copy and paste the entire content of dev_schema.sql here
-- (The file contains the complete schema from your working dev database)

-- STEP 4: Apply the dev data (optional)
-- Copy and paste the entire content of dev_data.sql here
-- (This will restore all your data from dev)

-- STEP 5: Test the function
SELECT 'Database reset complete' as status;

-- Test the get_users_lite function
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
