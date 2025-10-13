-- Add INSERT policy for widget_config
-- Admins can create widget configs when upserting

create policy "widget_config insertable by org admins"
  on public.widget_config for insert
  with check (exists (
    select 1 from public.projects p
    join public.memberships m on m.org_id = p.org_id
    where p.id = widget_config.project_id and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  ));

COMMENT ON POLICY "widget_config insertable by org admins" ON public.widget_config 
  IS 'Allow admins to insert widget configs (for upsert operations)';

