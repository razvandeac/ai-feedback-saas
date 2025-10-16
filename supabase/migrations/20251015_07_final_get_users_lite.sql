-- =====================================================
-- COMPREHENSIVE FIX FOR get_users_lite FUNCTION
-- This should definitely work to show emails
-- =====================================================

-- First, let's check if the function exists and drop it
DROP FUNCTION IF EXISTS public.get_users_lite(uuid[]);

-- Create the function with proper syntax
CREATE OR REPLACE FUNCTION public.get_users_lite(ids uuid[])
RETURNS TABLE(id uuid, email text, full_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id::uuid,
    u.email::text,
    COALESCE((u.raw_user_meta_data->>'full_name')::text, '')::text as full_name
  FROM auth.users u
  WHERE u.id = ANY(ids);
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO authenticated;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO anon;

-- Test the function
SELECT 'Function created successfully' as status;

-- Test with actual data
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
