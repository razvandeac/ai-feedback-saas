-- Table holds published snapshots per project
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='widget_versions') then
    create table public.widget_versions (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references public.projects(id) on delete cascade,
      version int not null,
      settings jsonb not null,
      published_at timestamptz not null default now(),
      published_by uuid not null, -- auth.users.id
      created_at timestamptz not null default now(),
      unique (project_id, version)
    );
    create index if not exists widget_versions_project_version_idx on public.widget_versions(project_id, version desc);
  end if;
end $$;

-- RLS
alter table public.widget_versions enable row level security;

-- Members can read versions for their org's projects
do $$
begin
  if not exists (select 1 from pg_policies where tablename='widget_versions' and policyname='widget_versions_member_select') then
    create policy widget_versions_member_select on public.widget_versions
      for select
      using (
        exists (
          select 1
          from public.projects p
          join public.org_members m on m.org_id = p.org_id
          where p.id = widget_versions.project_id and m.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Only org admins can insert (publish) or delete (cleanup) versions
do $$
begin
  if not exists (select 1 from pg_policies where tablename='widget_versions' and policyname='widget_versions_admin_insert') then
    create policy widget_versions_admin_insert on public.widget_versions
      for insert
      with check (
        exists (
          select 1
          from public.projects p
          join public.org_members m on m.org_id = p.org_id
          where p.id = widget_versions.project_id and m.user_id = auth.uid() and m.role = 'admin'
        )
      );
  end if;

  if not exists (select 1 from pg_policies where tablename='widget_versions' and policyname='widget_versions_admin_delete') then
    create policy widget_versions_admin_delete on public.widget_versions
      for delete
      using (
        exists (
          select 1
          from public.projects p
          join public.org_members m on m.org_id = p.org_id
          where p.id = widget_versions.project_id and m.user_id = auth.uid() and m.role = 'admin'
        )
      );
  end if;
end $$;

-- Helper to get next version number
create or replace function public.next_widget_version(pid uuid)
returns int
language sql
stable
as $$
  select coalesce(max(version), 0) + 1
  from public.widget_versions
  where project_id = pid;
$$;
