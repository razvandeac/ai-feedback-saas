-- =====================================================
-- VAMOOT PRODUCTION SEED DATA
-- Minimal "hello world" seed (idempotent)
-- =====================================================

-- Create an org without linking a user (membership will be created via app)
insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Vamoot Demo Org', 'demo-org')
on conflict (id) do nothing;

-- Create a project for it
insert into public.projects (id, org_id, name, api_key)
values ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Demo Project', 'demo-api-key-123')
on conflict (id) do nothing;
