-- Simpler version using SQL function instead of plpgsql
DROP FUNCTION IF EXISTS get_users_lite(uuid[]);

CREATE OR REPLACE FUNCTION get_users_lite(ids uuid[])
RETURNS TABLE (
  id uuid,
  email text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.email::text,
    (u.raw_user_meta_data->>'full_name')::text
  FROM auth.users u
  WHERE u.id = ANY(ids);
$$;

GRANT EXECUTE ON FUNCTION get_users_lite(uuid[]) TO authenticated, anon;

COMMENT ON FUNCTION get_users_lite IS 'Fetch minimal user display data. SECURITY DEFINER to bypass RLS.';

