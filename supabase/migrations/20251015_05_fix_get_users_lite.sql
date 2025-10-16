-- =====================================================
-- FIX get_users_lite FUNCTION IN PRODUCTION
-- This should fix the RPC call to show emails instead of IDs
-- =====================================================

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS public.get_users_lite(uuid[]);

CREATE OR REPLACE FUNCTION public.get_users_lite(ids uuid[])
RETURNS TABLE(id uuid, email text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::uuid,
    u.email::text,
    COALESCE((u.raw_user_meta_data->>'full_name')::text, '')::text as full_name
  FROM auth.users u
  WHERE u.id = ANY(ids);
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO authenticated;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO anon;

-- Test the function
SELECT 'Function created successfully' as status;
