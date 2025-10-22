-- Table: one row per project
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='widget_config') then
    create table public.widget_config (
      project_id uuid primary key references public.projects(id) on delete cascade,
      settings jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    );
  end if;
end $$;

-- Helpful index for jsonb queries later
do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='widget_config_settings_gin') then
    create index widget_config_settings_gin on public.widget_config using gin (settings jsonb_path_ops);
  end if;
end $$;

-- RLS
alter table public.widget_config enable row level security;

-- Policy: members of the owning org can read/write config (join via projects)
do $$
begin
  if not exists (select 1 from pg_policies where tablename='widget_config' and policyname='widget_config_member_rw') then
    create policy widget_config_member_rw on public.widget_config for all
    using (
      exists (
        select 1
        from public.projects p
        join public.org_members m on m.org_id = p.org_id
        where p.id = project_id and m.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1
        from public.projects p
        join public.org_members m on m.org_id = p.org_id
        where p.id = project_id and m.user_id = auth.uid()
      )
    );
  end if;
end $$;

-- Seed an empty config for existing projects (idempotent)
insert into public.widget_config (project_id)
select p.id from public.projects p
left join public.widget_config w on w.project_id = p.id
where w.project_id is null;
