-- =====================================================
-- PRODUCTION DATABASE RESET SCRIPT
-- Run this in production Supabase SQL Editor
-- =====================================================

-- STEP 1: Drop everything (WARNING: This deletes all data!)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Set proper ownership
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- STEP 2: Run the complete schema
-- (Copy and paste the entire content of production_schema.sql here)
-- OR run it as a separate query after this one

-- STEP 3: After running the schema, test the function
SELECT 'Database reset complete' as status;

-- Test the get_users_lite function
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
