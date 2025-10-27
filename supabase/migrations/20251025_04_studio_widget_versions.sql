-- Create studio_widget_versions table for version history
create table if not exists studio_widget_versions (
  id uuid primary key default gen_random_uuid(),
  widget_id uuid references studio_widgets(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  version int not null,
  config jsonb not null,
  created_at timestamptz default now()
);

-- Create index for efficient queries
create index if not exists swv_widget_idx on studio_widget_versions(widget_id, version desc);

-- Backfill one version from existing published configs
insert into studio_widget_versions(widget_id, org_id, version, config)
select id, org_id, coalesce(version, 1), coalesce(published_config, widget_config, '{}'::jsonb)
from studio_widgets
where id not in (select widget_id from studio_widget_versions);

-- Enable RLS
alter table studio_widget_versions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "studio_widget_versions_select" on studio_widget_versions;
drop policy if exists "studio_widget_versions_insert" on studio_widget_versions;
drop policy if exists "studio_widget_versions_delete" on studio_widget_versions;

-- RLS Policies for studio_widget_versions
create policy "studio_widget_versions_select" on studio_widget_versions
  for select using (
    exists (
      select 1 from org_members om
      where om.org_id = studio_widget_versions.org_id 
      and om.user_id = auth.uid()
    )
  );

create policy "studio_widget_versions_insert" on studio_widget_versions
  for insert with check (
    exists (
      select 1 from org_members om
      where om.org_id = studio_widget_versions.org_id 
      and om.user_id = auth.uid()
    )
  );

create policy "studio_widget_versions_delete" on studio_widget_versions
  for delete using (
    exists (
      select 1 from org_members om
      where om.org_id = studio_widget_versions.org_id 
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
    )
  );
