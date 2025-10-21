-- Emergency fix: Simple RLS policy for organization creation
-- Drop all existing policies first (comprehensive list)
drop policy if exists "orgs_authenticated_create" on public.organizations;
drop policy if exists "orgs_member_select" on public.organizations;
drop policy if exists "orgs_admin_all" on public.organizations;
drop policy if exists "orgs_admin_update" on public.organizations;
drop policy if exists "orgs_admin_delete" on public.organizations;
drop policy if exists "organizations select by org members" on public.organizations;
drop policy if exists "organizations admin all" on public.organizations;
drop policy if exists "organizations member select" on public.organizations;

-- Create a simple policy that allows authenticated users to create organizations
-- This is safe because the server action will add them as admin automatically
create policy orgs_authenticated_create on public.organizations for insert
  with check (auth.uid() is not null);

-- Allow users to see organizations they're members of
create policy orgs_member_select on public.organizations for select
  using (
    exists (
      select 1 from public.org_members 
      where org_id = organizations.id 
      and user_id = auth.uid()
    )
  );

-- Allow admins to update/delete their organizations
create policy orgs_admin_update on public.organizations for update
  using (
    exists (
      select 1 from public.org_members 
      where org_id = organizations.id 
      and user_id = auth.uid() 
      and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.org_members 
      where org_id = organizations.id 
      and user_id = auth.uid() 
      and role = 'admin'
    )
  );

create policy orgs_admin_delete on public.organizations for delete
  using (
    exists (
      select 1 from public.org_members 
      where org_id = organizations.id 
      and user_id = auth.uid() 
      and role = 'admin'
    )
  );
