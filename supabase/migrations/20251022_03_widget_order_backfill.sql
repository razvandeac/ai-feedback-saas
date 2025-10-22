update public.widget_config
set settings = jsonb_set(
  settings,
  '{order}',
  to_jsonb(array['rating','comment'])
)
where (settings->'order') is null;
