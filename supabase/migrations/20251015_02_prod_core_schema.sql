-- =====================================================
-- VAMOOT PRODUCTION CORE SCHEMA MIGRATION
-- Applies only the essential changes for production
-- =====================================================

-- Create org_members table (alias for memberships for consistency)
do $$ begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='org_members') then
    create table public.org_members (
      org_id uuid not null references public.organizations(id) on delete cascade,
      user_id uuid not null references auth.users(id) on delete cascade,
      role text not null default 'member',
      created_at timestamptz not null default now(),
      primary key (org_id, user_id)
    );
    create index on public.org_members(user_id);
    
    -- Copy data from memberships table if it exists
    if exists (select 1 from pg_tables where schemaname='public' and tablename='memberships') then
      insert into public.org_members (org_id, user_id, role, created_at)
      select org_id, user_id, role, created_at
      from public.memberships
      on conflict (org_id, user_id) do nothing;
    end if;
  end if;
end $$;

-- Create responses table
do $$ begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='responses') then
    create table public.responses (
      id uuid primary key default gen_random_uuid(),
      org_id uuid not null references public.organizations(id) on delete cascade,
      project_id uuid not null references public.projects(id) on delete cascade,
      feedback_id uuid not null references public.feedback(id) on delete cascade,
      summary text,
      tags text[],
      created_at timestamptz not null default now()
    );
    create index on public.responses(org_id);
    create index on public.responses(project_id);
    create index on public.responses(feedback_id);
  end if;
end $$;

-- Add org_id to feedback table if missing (for proper RLS)
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='feedback' and column_name='org_id'
  ) then
    alter table public.feedback add column org_id uuid references public.organizations(id) on delete cascade;
    create index on public.feedback(org_id);
    
    -- Populate org_id from projects
    update public.feedback 
    set org_id = p.org_id 
    from public.projects p 
    where feedback.project_id = p.id;
    
    -- Make org_id not null after populating
    alter table public.feedback alter column org_id set not null;
  end if;
end $$;

-- Drop existing policies that depend on the functions (if they exist)
drop policy if exists "orgs_member_select" on public.organizations;
drop policy if exists "inv_select_member" on public.invites;
drop policy if exists "projects_member" on public.projects;
drop policy if exists "widgets_member" on public.widgets;
drop policy if exists "feedback_member" on public.feedback;
drop policy if exists "feedback_write_member" on public.feedback;
drop policy if exists "events_member" on public.events;

-- Helper functions (drop and recreate to avoid parameter name conflicts)
drop function if exists public.is_org_member(uuid);
drop function if exists public.is_org_admin(uuid);

create or replace function public.is_org_member(org_id uuid)
returns boolean language plpgsql security definer as $$
begin
  return exists(
    select 1 from public.org_members m
    where m.org_id = $1 and m.user_id = auth.uid()
  );
end;
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean language plpgsql security definer as $$
begin
  return exists(
    select 1 from public.org_members m
    where m.org_id = $1 and m.user_id = auth.uid() and m.role = 'admin'
  );
end;
$$;

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.projects enable row level security;
alter table public.feedback enable row level security;
alter table public.responses enable row level security;
alter table public.widget_config enable row level security;

-- RLS Policies
do $$ begin
  -- organizations
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='organizations' and policyname='orgs_member_select') then
    create policy orgs_member_select on public.organizations for select
      using ( public.is_org_member(id) );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='organizations' and policyname='orgs_admin_all') then
    create policy orgs_admin_all on public.organizations for all
      using ( public.is_org_admin(id) )
      with check ( public.is_org_admin(id) );
  end if;

  -- org_members (members can read; only admins can manage)
  if not exists (select 1 from pg_policies where tablename='org_members' and policyname='org_members_select') then
    create policy org_members_select on public.org_members for select
      using ( public.is_org_member(org_id) );
  end if;
  if not exists (select 1 from pg_policies where tablename='org_members' and policyname='org_members_admin_all') then
    create policy org_members_admin_all on public.org_members for all
      using ( public.is_org_admin(org_id) )
      with check ( public.is_org_admin(org_id) );
  end if;

  -- projects
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_member_rw') then
    create policy projects_member_rw on public.projects for all
      using ( public.is_org_member(org_id) )
      with check ( public.is_org_member(org_id) );
  end if;

  -- feedback (members can read/write within org)
  if not exists (select 1 from pg_policies where tablename='feedback' and policyname='feedback_member_rw') then
    create policy feedback_member_rw on public.feedback for all
      using ( public.is_org_member(org_id) )
      with check ( public.is_org_member(org_id) );
  end if;

  -- responses (members can read/write within org)
  if not exists (select 1 from pg_policies where tablename='responses' and policyname='responses_member_rw') then
    create policy responses_member_rw on public.responses for all
      using ( public.is_org_member(org_id) )
      with check ( public.is_org_member(org_id) );
  end if;

  -- widget_config (members can read/write)
  if not exists (select 1 from pg_policies where tablename='widget_config' and policyname='widget_config_member_rw') then
    create policy widget_config_member_rw on public.widget_config for all
      using ( exists(select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)) )
      with check ( exists(select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)) );
  end if;
end $$;
