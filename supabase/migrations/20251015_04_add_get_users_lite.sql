-- =====================================================
-- ADD MISSING get_users_lite FUNCTION TO PRODUCTION
-- This function is needed for the members page to show user emails
-- =====================================================

-- Create the get_users_lite function if it doesn't exist
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

-- Grant execute permission to anon users (if needed for public access)
GRANT EXECUTE ON FUNCTION public.get_users_lite(uuid[]) TO anon;
