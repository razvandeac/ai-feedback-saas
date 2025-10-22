-- 1) Platform admins registry (global) - handle existing table structure
-- Check if table exists and has the right structure
do $$
begin
  -- If table doesn't exist, create it
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'platform_admins') then
    create table public.platform_admins (
      user_id uuid primary key,            -- maps to auth.users.id
      granted_at timestamptz not null default now()
    );
  -- If table exists but has wrong structure (email instead of user_id), alter it
  elsif exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'platform_admins' and column_name = 'email') then
    -- Drop the old table and recreate with correct structure
    drop table if exists public.platform_admins cascade;
    create table public.platform_admins (
      user_id uuid primary key,            -- maps to auth.users.id
      granted_at timestamptz not null default now()
    );
  end if;
end $$;

-- 2) Helper function to check platform admin
create or replace function public.is_platform_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(select 1 from public.platform_admins p where p.user_id = uid);
$$;

-- 3) Ensure organizations has RLS enabled
alter table public.organizations enable row level security;

-- 4) Insert policy: only platform admins may create organizations
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='organizations' and policyname='orgs_platform_insert'
  ) then
    create policy orgs_platform_insert
    on public.organizations
    for insert
    with check ( public.is_platform_admin(auth.uid()) );
  end if;
end $$;

-- 5) (Optional) Platform admins can update/delete any org (site ops)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='organizations' and policyname='orgs_platform_admin_all'
  ) then
    create policy orgs_platform_admin_all
    on public.organizations
    for all
    using ( public.is_platform_admin(auth.uid()) )
    with check ( public.is_platform_admin(auth.uid()) );
  end if;
end $$;
