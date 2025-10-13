-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS get_users_lite(uuid[]);

-- Create RPC function to fetch user display data
CREATE OR REPLACE FUNCTION get_users_lite(ids uuid[])
RETURNS TABLE (
  id uuid,
  email text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
  FROM auth.users u
  WHERE u.id = ANY(ids);
END;
$$;

-- Grant execute to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_users_lite(uuid[]) TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION get_users_lite IS 'Fetch minimal user display data (id, email, full_name) for UI enrichment. SECURITY DEFINER to bypass RLS.';

