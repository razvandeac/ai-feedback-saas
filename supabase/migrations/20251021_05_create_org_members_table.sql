-- Create missing org_members table if it doesn't exist
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  created_at timestamp with time zone default now(),
  unique(org_id, user_id)
);

-- Enable RLS
alter table public.org_members enable row level security;

-- Create indexes
create index if not exists org_members_org_id_idx on public.org_members(org_id);
create index if not exists org_members_user_id_idx on public.org_members(user_id);

-- Create RLS policies for org_members
drop policy if exists "org_members_select" on public.org_members;
create policy org_members_select on public.org_members for select
  using (
    exists (
      select 1 from public.org_members om2 
      where om2.org_id = org_members.org_id 
      and om2.user_id = auth.uid()
    )
  );

drop policy if exists "org_members_insert" on public.org_members;
create policy org_members_insert on public.org_members for insert
  with check (
    auth.uid() is not null and (
      -- Allow if user is admin of the org
      exists (
        select 1 from public.org_members om 
        where om.org_id = org_members.org_id 
        and om.user_id = auth.uid() 
        and om.role = 'admin'
      )
      -- OR if this is the first member (org creator)
      or not exists (
        select 1 from public.org_members om 
        where om.org_id = org_members.org_id
      )
    )
  );

drop policy if exists "org_members_update" on public.org_members;
create policy org_members_update on public.org_members for update
  using (
    exists (
      select 1 from public.org_members om 
      where om.org_id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.org_members om 
      where om.org_id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  );

drop policy if exists "org_members_delete" on public.org_members;
create policy org_members_delete on public.org_members for delete
  using (
    exists (
      select 1 from public.org_members om 
      where om.org_id = org_members.org_id 
      and om.user_id = auth.uid() 
      and om.role = 'admin'
    )
  );
