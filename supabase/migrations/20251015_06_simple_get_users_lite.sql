-- =====================================================
-- SIMPLE get_users_lite FUNCTION FOR PRODUCTION
-- This should definitely work
-- =====================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_users_lite(uuid[]);

-- Create a simple function that definitely works
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO anon;

-- Test it immediately
SELECT 'Testing function...' as status;
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
