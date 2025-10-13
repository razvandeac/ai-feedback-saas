-- Grant SELECT on auth.users to authenticated role
-- This is needed for foreign key validation on invited_by column
-- RLS policies on auth.users still apply, so users can only see their own data

GRANT SELECT ON auth.users TO authenticated;

COMMENT ON TABLE auth.users IS 'Supabase auth users table. SELECT granted to authenticated for FK validation.';

