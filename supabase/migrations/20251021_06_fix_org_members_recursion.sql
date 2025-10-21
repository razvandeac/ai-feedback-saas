-- Fix infinite recursion in org_members RLS policies
-- Drop all existing policies first
drop policy if exists "org_members_select" on public.org_members;
drop policy if exists "org_members_insert" on public.org_members;
drop policy if exists "org_members_update" on public.org_members;
drop policy if exists "org_members_delete" on public.org_members;

-- Create simple, non-recursive policies
create policy org_members_select on public.org_members for select
  using (user_id = auth.uid() or org_id in (
    select org_id from public.org_members where user_id = auth.uid()
  ));

create policy org_members_insert on public.org_members for insert
  with check (
    auth.uid() is not null and (
      -- Allow if user is inserting themselves
      user_id = auth.uid()
      -- OR if user is admin of the org (check organizations table instead)
      or exists (
        select 1 from public.organizations o
        join public.org_members om on o.id = om.org_id
        where o.id = org_members.org_id 
        and om.user_id = auth.uid() 
        and om.role = 'admin'
      )
    )
  );

create policy org_members_update on public.org_members for update
  using (
    user_id = auth.uid() or exists (
      select 1 from public.organizations o
      join public.org_members om on o.id = om.org_id
      where o.id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  )
  with check (
    user_id = auth.uid() or exists (
      select 1 from public.organizations o
      join public.org_members om on o.id = om.org_id
      where o.id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  );

create policy org_members_delete on public.org_members for delete
  using (
    user_id = auth.uid() or exists (
      select 1 from public.organizations o
      join public.org_members om on o.id = om.org_id
      where o.id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  );
