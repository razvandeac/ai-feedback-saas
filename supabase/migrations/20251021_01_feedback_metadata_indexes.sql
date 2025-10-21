-- Ensure column exists and is jsonb with default
alter table public.feedback
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Helpful indexes for dashboard queries
do $$ begin
  -- filter by project and time
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='feedback_project_created_idx') then
    create index feedback_project_created_idx on public.feedback (project_id, created_at desc);
  end if;
  -- jsonb GIN for metadata queries/filters later
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='feedback_metadata_gin') then
    create index feedback_metadata_gin on public.feedback using gin (metadata jsonb_path_ops);
  end if;
end $$;

-- RLS: if you previously referenced path/user_agent columns in policies, remove them.
-- Keep your generic insert policy that checks project/org consistency:
create policy if not exists feedback_public_insert
on public.feedback for insert
with check (
  project_id is not null
  and org_id is not null
  and exists(select 1 from public.projects p where p.id = project_id and p.org_id = org_id)
);
