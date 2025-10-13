-- Grant necessary permissions on org_invites table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_invites TO authenticated;
GRANT SELECT ON public.org_invites TO anon;

