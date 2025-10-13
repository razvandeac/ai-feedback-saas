-- Temporarily disable RLS on org_invites to diagnose the issue
-- We'll add proper policies after

ALTER TABLE org_invites DISABLE ROW LEVEL SECURITY;

-- Add a simple policy that doesn't reference users table
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert invites for their orgs
CREATE POLICY "Users can create invites for their orgs" ON org_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.org_id = org_invites.org_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

-- Allow users to view invites for their orgs
CREATE POLICY "Users can view invites for their orgs" ON org_invites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.org_id = org_invites.org_id
      AND memberships.user_id = auth.uid()
    )
  );

-- Allow admins to update (revoke) invites
CREATE POLICY "Admins can update invites for their orgs" ON org_invites
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.org_id = org_invites.org_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

