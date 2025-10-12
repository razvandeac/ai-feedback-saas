-- Grant necessary permissions to authenticated users
-- These grants are required for RLS policies to work

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT ON public.organizations TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT SELECT ON public.memberships TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;
GRANT SELECT ON public.invites TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.projects TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.widgets TO authenticated;
GRANT SELECT ON public.widgets TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT SELECT, INSERT ON public.feedback TO anon; -- anon can submit feedback

GRANT SELECT, INSERT ON public.events TO authenticated, anon; -- both can log events

-- Grant sequence usage for auto-increment IDs
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO authenticated, anon;

