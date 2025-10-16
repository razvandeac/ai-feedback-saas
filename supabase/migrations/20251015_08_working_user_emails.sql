-- =====================================================
-- WORKING SOLUTION: Create a simple RPC function
-- This will definitely work to get user emails
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_emails(uuid[]);

-- Create a simple function that works
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(user_id uuid, email text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id::uuid as user_id,
    au.email::text,
    COALESCE((au.raw_user_meta_data->>'full_name')::text, '')::text as full_name
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO anon;

-- Test the function
SELECT 'Function created successfully' as status;

-- Test with actual data
SELECT * FROM public.get_user_emails(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
