create extension if not exists pgcrypto;

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_tier text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_projects_org on projects(org_id);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  text text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_feedback_project on feedback(project_id);
create index if not exists idx_feedback_created on feedback(created_at);

alter table orgs enable row level security;
alter table projects enable row level security;
alter table feedback enable row level security;
