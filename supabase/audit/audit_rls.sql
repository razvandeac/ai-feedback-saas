-- =====================================================
-- VAMOOT RLS AUDIT SCRIPT
-- Run this in Supabase Studio to verify schema and RLS
-- =====================================================

-- Missing expected tables
with expected(name) as (
  values
  ('organizations'),
  ('org_members'),
  ('projects'),
  ('feedback'),
  ('responses'),
  ('widget_config')
)
select e.name as expected_table, (t.tablename is not null) as exists
from expected e
left join pg_tables t on t.schemaname='public' and t.tablename=e.name
order by e.name;

-- RLS status
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public' and c.relkind='r'
  and c.relname in ('organizations','org_members','projects','feedback','responses','widget_config')
order by c.relname;

-- Policies
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname='public'
  and tablename in ('organizations','org_members','projects','feedback','responses','widget_config')
order by tablename, policyname;

-- FKs & on delete behavior
select
  tc.table_name    as child_table,
  kcu.column_name  as child_column,
  ccu.table_name   as parent_table,
  ccu.column_name  as parent_column,
  rc.delete_rule   as on_delete
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name and tc.table_schema = rc.constraint_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = rc.unique_constraint_name and ccu.constraint_schema = rc.unique_constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and (ccu.table_name in ('organizations','projects') or tc.table_name in ('org_members','projects','feedback','responses','widget_config'))
order by child_table, child_column;
