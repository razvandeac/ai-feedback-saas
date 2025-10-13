-- Create RPC function to fetch user display data
-- This bypasses RLS with SECURITY DEFINER to allow fetching user info for display purposes

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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_users_lite(uuid[]) TO authenticated;

COMMENT ON FUNCTION get_users_lite IS 'Fetch minimal user display data (id, email, full_name) for UI enrichment. SECURITY DEFINER to bypass RLS.';

