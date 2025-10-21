-- Proper fix: Create RLS policies without recursion
-- Drop all existing policies
drop policy if exists "org_members_select" on public.org_members;
drop policy if exists "org_members_insert" on public.org_members;
drop policy if exists "org_members_update" on public.org_members;
drop policy if exists "org_members_delete" on public.org_members;

-- Re-enable RLS
alter table public.org_members enable row level security;

-- Create non-recursive policies
create policy org_members_select on public.org_members for select
  using (
    -- User can see their own memberships
    user_id = auth.uid()
    -- OR user can see members of orgs they belong to
    or org_id in (
      select om2.org_id 
      from public.org_members om2 
      where om2.user_id = auth.uid()
    )
  );

create policy org_members_insert on public.org_members for insert
  with check (
    auth.uid() is not null and (
      -- User can add themselves to any org
      user_id = auth.uid()
      -- OR if this is the first member of an org (org creator)
      or not exists (
        select 1 from public.org_members om 
        where om.org_id = org_members.org_id
      )
    )
  );

create policy org_members_update on public.org_members for update
  using (
    -- User can update their own membership
    user_id = auth.uid()
    -- OR admin can update any membership in their org
    or exists (
      select 1 from public.org_members om 
      where om.org_id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  )
  with check (
    -- User can update their own membership
    user_id = auth.uid()
    -- OR admin can update any membership in their org
    or exists (
      select 1 from public.org_members om 
      where om.org_id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  );

create policy org_members_delete on public.org_members for delete
  using (
    -- User can delete their own membership
    user_id = auth.uid()
    -- OR admin can delete any membership in their org
    or exists (
      select 1 from public.org_members om 
      where om.org_id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  );
