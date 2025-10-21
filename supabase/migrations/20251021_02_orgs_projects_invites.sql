-- Enable crypto helpers if needed
create extension if not exists pgcrypto;

-- organizations (add slug for SEO / nested routes)
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='organizations') then
    create table public.organizations (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      slug citext unique, -- can be null initially; app will set unique slugs
      created_at timestamptz not null default now()
    );
  end if;
  -- ensure slug column exists & unique
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='organizations' and column_name='slug'
  ) then
    alter table public.organizations add column slug citext;
  end if;
  -- unique index on slug (nulls allowed)
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='organizations_slug_key') then
    create unique index organizations_slug_key on public.organizations (slug);
  end if;
end$$;

-- org_members
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='org_members') then
    create table public.org_members (
      org_id uuid not null references public.organizations(id) on delete cascade,
      user_id uuid not null, -- maps to auth.users.id
      role text not null default 'member', -- 'admin' | 'member'
      created_at timestamptz not null default now(),
      primary key (org_id, user_id)
    );
    create index if not exists org_members_user_idx on public.org_members(user_id);
  end if;
end$$;

-- projects
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='projects') then
    create table public.projects (
      id uuid primary key default gen_random_uuid(),
      org_id uuid not null references public.organizations(id) on delete cascade,
      name text not null,
      api_key text not null default encode(gen_random_bytes(16), 'hex'),
      created_at timestamptz not null default now()
    );
    create index if not exists projects_org_idx on public.projects(org_id);
  end if;
end$$;

-- invites
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='invites') then
    create table public.invites (
      id uuid primary key default gen_random_uuid(),
      org_id uuid not null references public.organizations(id) on delete cascade,
      email citext not null,
      token text not null,
      role text not null default 'member',
      expires_at timestamptz not null default (now() + interval '7 days'),
      accepted_at timestamptz,
      created_at timestamptz not null default now(),
      unique (org_id, email)
    );
    create index if not exists invites_org_idx on public.invites(org_id);
    create index if not exists invites_email_idx on public.invites(email);
    create index if not exists invites_token_idx on public.invites(token);
  end if;
end$$;

-- helper functions
create or replace function public.is_org_member(uid uuid, org uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.org_members m where m.org_id = org and m.user_id = uid);
$$;

create or replace function public.is_org_admin(uid uuid, org uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.org_members m where m.org_id = org and m.user_id = uid and m.role = 'admin');
$$;

-- RLS enable
alter table public.organizations enable row level security;
alter table public.org_members  enable row level security;
alter table public.projects     enable row level security;
alter table public.invites      enable row level security;

-- policies: organizations
do $$
begin
  if not exists (select 1 from pg_policies where tablename='organizations' and policyname='orgs_member_select') then
    create policy orgs_member_select on public.organizations for select
      using (public.is_org_member(auth.uid(), id));
  end if;
  if not exists (select 1 from pg_policies where tablename='organizations' and policyname='orgs_admin_all') then
    create policy orgs_admin_all on public.organizations for all
      using (public.is_org_admin(auth.uid(), id))
      with check (public.is_org_admin(auth.uid(), id));
  end if;
end$$;

-- policies: org_members
do $$
begin
  if not exists (select 1 from pg_policies where tablename='org_members' and policyname='org_members_select') then
    create policy org_members_select on public.org_members for select
      using (public.is_org_member(auth.uid(), org_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='org_members' and policyname='org_members_admin_all') then
    create policy org_members_admin_all on public.org_members for all
      using (public.is_org_admin(auth.uid(), org_id))
      with check (public.is_org_admin(auth.uid(), org_id));
  end if;
end$$;

-- policies: projects (members read; admins write)
do $$
begin
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_member_select') then
    create policy projects_member_select on public.projects for select
      using (public.is_org_member(auth.uid(), org_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_admin_all') then
    create policy projects_admin_all on public.projects for all
      using (public.is_org_admin(auth.uid(), org_id))
      with check (public.is_org_admin(auth.uid(), org_id));
  end if;
end$$;

-- policies: invites (members read; admins manage)
do $$
begin
  if not exists (select 1 from pg_policies where tablename='invites' and policyname='invites_member_select') then
    create policy invites_member_select on public.invites for select
      using (public.is_org_member(auth.uid(), org_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='invites' and policyname='invites_admin_all') then
    create policy invites_admin_all on public.invites for all
      using (public.is_org_admin(auth.uid(), org_id))
      with check (public.is_org_admin(auth.uid(), org_id));
  end if;
end$$;

-- helpful indexes for dashboard filtering
do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='projects_created_idx') then
    create index projects_created_idx on public.projects (created_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='organizations_created_idx') then
    create index organizations_created_idx on public.organizations (created_at desc);
  end if;
end $$;
