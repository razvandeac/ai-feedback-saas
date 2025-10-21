-- Emergency fix: Temporarily disable RLS on org_members to fix recursion
-- Drop all policies
drop policy if exists "org_members_select" on public.org_members;
drop policy if exists "org_members_insert" on public.org_members;
drop policy if exists "org_members_update" on public.org_members;
drop policy if exists "org_members_delete" on public.org_members;

-- Temporarily disable RLS on org_members
alter table public.org_members disable row level security;

-- Keep RLS enabled on organizations but with simple policies
drop policy if exists "orgs_authenticated_create" on public.organizations;
drop policy if exists "orgs_member_select" on public.organizations;
drop policy if exists "orgs_admin_update" on public.organizations;
drop policy if exists "orgs_admin_delete" on public.organizations;

-- Simple organization policies
create policy orgs_authenticated_create on public.organizations for insert
  with check (auth.uid() is not null);

create policy orgs_member_select on public.organizations for select
  using (
    exists (
      select 1 from public.org_members 
      where org_id = organizations.id 
      and user_id = auth.uid()
    )
  );

create policy orgs_admin_all on public.organizations for all
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
