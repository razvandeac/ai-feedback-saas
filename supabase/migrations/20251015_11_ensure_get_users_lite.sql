-- =====================================================
-- TEST: Check if get_users_lite function exists in production
-- =====================================================

-- Check if function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_users_lite' 
  AND routine_schema = 'public';

-- If it doesn't exist, create it
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

-- Test the function
SELECT 'Function created/verified successfully' as status;

-- Test with actual data
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members WHERE org_id = (SELECT id FROM public.organizations WHERE slug = 'vamoot-inc') LIMIT 1)
]::uuid[]);
