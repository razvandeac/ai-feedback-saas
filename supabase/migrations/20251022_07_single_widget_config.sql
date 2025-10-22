-- Add canonical widget_config column
alter table public.widget_config
  add column if not exists widget_config jsonb;

-- Ensure widget_config is an object if not null
alter table public.widget_config
  add constraint widget_config_widget_config_is_object
  check (widget_config is null or jsonb_typeof(widget_config) = 'object');

-- Backfill from settings to widget_config
update public.widget_config
set widget_config = jsonb_build_object(
  'theme', jsonb_build_object(
    'variant', 'light',
    'primaryColor', '#000000',
    'backgroundColor', '#ffffff',
    'fontFamily', 'Inter',
    'borderRadius', 8
  ),
  'blocks', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'type', 'legacy',
      'version', 1,
      'data', coalesce(settings, '{}'::jsonb)
    )
  )
)
where widget_config is null;

-- Enforce presence going forward
alter table public.widget_config
  alter column widget_config set not null;

-- Drop legacy column
alter table public.widget_config
  drop column if exists settings;

-- Helpful index
create index if not exists idx_widget_config_widget_config_gin
  on public.widget_config using gin (widget_config jsonb_path_ops);
