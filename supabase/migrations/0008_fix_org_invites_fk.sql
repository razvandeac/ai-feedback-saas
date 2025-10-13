-- Fix org_invites foreign key constraints
-- The invited_by column likely has FK to auth.users which causes permission errors

-- Drop FK constraint on invited_by if it exists (to auth.users)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%org_invites%invited_by%'
    AND table_name = 'org_invites'
  ) THEN
    ALTER TABLE org_invites DROP CONSTRAINT IF EXISTS org_invites_invited_by_fkey;
  END IF;
END $$;

-- Make invited_by reference users via RPC lookup instead of FK
-- The invited_by column stays as uuid but without FK constraint
-- This avoids permission issues when inserting

COMMENT ON COLUMN org_invites.invited_by IS 'User ID who created the invite. Use get_users_lite RPC to fetch display data.';
