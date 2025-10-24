-- Add publish fields to widgets table
alter table widgets
  add column if not exists published_config jsonb,
  add column if not exists published_at timestamptz,
  add column if not exists version integer default 1;

-- Initialize published_config for existing rows
update widgets
set published_config = coalesce(published_config, config)
where published_config is null;

-- Add widget_id foreign key to projects table
alter table projects
  add column if not exists widget_id uuid references widgets(id) on delete set null;

-- Create index for performance
create index if not exists projects_widget_id_idx on projects(widget_id);
