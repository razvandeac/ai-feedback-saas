-- Fix RLS policies to allow organization creation
-- Allow users to create their first organization OR admins to create additional ones
drop policy if exists "orgs_authenticated_create" on public.organizations;
create policy orgs_authenticated_create on public.organizations for insert
  with check (
    auth.uid() is not null and (
      -- User has no existing organizations (first org creation)
      not exists (
        select 1 from public.org_members 
        where user_id = auth.uid()
      )
      -- OR user is admin of at least one organization (can create additional orgs)
      or exists (
        select 1 from public.org_members 
        where user_id = auth.uid() and role = 'admin'
      )
    )
  );

-- Keep existing policies for select and update/delete
drop policy if exists "orgs_member_select" on public.organizations;
create policy orgs_member_select on public.organizations for select
  using (public.is_org_member(auth.uid(), id));

drop policy if exists "orgs_admin_all" on public.organizations;
create policy orgs_admin_all on public.organizations for all
  using (public.is_org_admin(auth.uid(), id))
  with check (public.is_org_admin(auth.uid(), id));
