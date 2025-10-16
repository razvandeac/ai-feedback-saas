-- =====================================================
-- DEBUG: Check if get_users_lite function exists and works
-- =====================================================

-- Check if function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_users_lite' 
  AND routine_schema = 'public';

-- Test the function with a simple call
SELECT 'Testing get_users_lite function...' as status;

-- Try to call the function
SELECT * FROM public.get_users_lite(ARRAY[
  (SELECT user_id FROM public.org_members LIMIT 1)
]::uuid[]);

-- If that fails, let's see what users exist
SELECT 'Available users in org_members:' as info;
SELECT user_id FROM public.org_members LIMIT 5;

-- Check if we can access auth.users directly
SELECT 'Testing direct auth.users access...' as status;
SELECT id, email FROM auth.users LIMIT 3;
