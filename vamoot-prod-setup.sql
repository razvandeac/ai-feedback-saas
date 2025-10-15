-- =====================================================
-- VAMOOT PRODUCTION DATABASE SETUP
-- Complete schema and sample data for vamoot-prod
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SCHEMA STRUCTURE
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(org_id, user_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    api_key text UNIQUE NOT NULL,
    allowed_origins text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    email text,
    name text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    properties jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create widgets table
CREATE TABLE IF NOT EXISTS public.widgets (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    config jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create widget_config table
CREATE TABLE IF NOT EXISTS public.widget_config (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    config jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(project_id)
);

-- Create org_invites table
CREATE TABLE IF NOT EXISTS public.org_invites (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'member',
    invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at timestamp with time zone DEFAULT (now() + interval '7 days') NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(org_id, email)
);

-- Create platform_admins table
CREATE TABLE IF NOT EXISTS public.platform_admins (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Create platform_feedback table
CREATE TABLE IF NOT EXISTS public.platform_feedback (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create invites table (legacy)
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'member',
    invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at timestamp with time zone DEFAULT (now() + interval '7 days') NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(org_id, email)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- Memberships indexes
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON public.memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON public.projects(api_key);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON public.feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_project_id ON public.events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

-- Widgets indexes
CREATE INDEX IF NOT EXISTS idx_widgets_project_id ON public.widgets(project_id);

-- Widget config indexes
CREATE INDEX IF NOT EXISTS idx_widget_config_project_id ON public.widget_config(project_id);

-- Org invites indexes
CREATE INDEX IF NOT EXISTS idx_org_invites_org_id ON public.org_invites(org_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.org_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.org_invites(email);

-- Platform feedback indexes
CREATE INDEX IF NOT EXISTS idx_platform_feedback_user_id ON public.platform_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_status ON public.platform_feedback(status);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_created_at ON public.platform_feedback(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get users lite
CREATE OR REPLACE FUNCTION public.get_users_lite(ids uuid[])
RETURNS TABLE(id uuid, email text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::uuid,
    u.email::text,
    COALESCE((u.raw_user_meta_data->>'full_name')::text, '')::text as full_name
  FROM auth.users u
  WHERE u.id = ANY(ids);
END;
$function$;

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  insert into public.profiles(user_id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (user_id) do nothing;
  return new;
end; $function$;

-- Function to handle org insert
CREATE OR REPLACE FUNCTION public.handle_org_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  -- Only create membership if there's an authenticated user
  IF auth.uid() IS NOT NULL THEN
    insert into public.memberships(org_id, user_id, role)
    values (new.id, auth.uid(), 'admin')
    on conflict (org_id, user_id) do nothing;
  END IF;
  return new;
end; $function$;

-- Function to check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE org_id = $1 
    AND user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

-- Function to check if user is org member
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE org_id = $1 
    AND user_id = auth.uid()
  );
END;
$function$;

-- Function to normalize origins
CREATE OR REPLACE FUNCTION public.normalize_origins(origins text[])
RETURNS text[]
LANGUAGE plpgsql
AS $function$
DECLARE
  normalized text[];
  origin text;
BEGIN
  normalized := '{}';
  
  FOREACH origin IN ARRAY origins
  LOOP
    -- Skip empty strings
    IF origin IS NOT NULL AND trim(origin) != '' THEN
      normalized := array_append(normalized, trim(origin));
    END IF;
  END LOOP;
  
  RETURN normalized;
END;
$function$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for org insert
DROP TRIGGER IF EXISTS on_org_insert ON public.organizations;
CREATE TRIGGER on_org_insert
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_org_insert();

-- Trigger function for projects normalize origins
CREATE OR REPLACE FUNCTION public.tg_projects_normalize_origins()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.allowed_origins := public.normalize_origins(NEW.allowed_origins);
  RETURN NEW;
END;
$function$;

-- Trigger for projects normalize origins
DROP TRIGGER IF EXISTS tg_projects_normalize_origins ON public.projects;
CREATE TRIGGER tg_projects_normalize_origins
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_projects_normalize_origins();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Organizations policies
DROP POLICY IF EXISTS "Users can view orgs they belong to" ON public.organizations;
CREATE POLICY "Users can view orgs they belong to" ON public.organizations FOR SELECT USING (public.is_org_member(id));
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations" ON public.organizations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can update organizations" ON public.organizations;
CREATE POLICY "Admins can update organizations" ON public.organizations FOR UPDATE USING (public.is_org_admin(id));

-- Memberships policies
DROP POLICY IF EXISTS "Users can view memberships in their orgs" ON public.memberships;
CREATE POLICY "Users can view memberships in their orgs" ON public.memberships FOR SELECT USING (public.is_org_member(org_id));
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL USING (public.is_org_admin(org_id));

-- Projects policies
DROP POLICY IF EXISTS "Users can view projects in their orgs" ON public.projects;
CREATE POLICY "Users can view projects in their orgs" ON public.projects FOR SELECT USING (public.is_org_member(org_id));
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.is_org_admin(org_id));

-- Feedback policies
DROP POLICY IF EXISTS "Users can view feedback in their orgs" ON public.feedback;
CREATE POLICY "Users can view feedback in their orgs" ON public.feedback FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON p.org_id = m.org_id
    WHERE p.id = project_id AND m.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);

-- Events policies
DROP POLICY IF EXISTS "Users can view events in their orgs" ON public.events;
CREATE POLICY "Users can view events in their orgs" ON public.events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON p.org_id = m.org_id
    WHERE p.id = project_id AND m.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);

-- Widgets policies
DROP POLICY IF EXISTS "Users can view widgets in their orgs" ON public.widgets;
CREATE POLICY "Users can view widgets in their orgs" ON public.widgets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON p.org_id = m.org_id
    WHERE p.id = project_id AND m.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Admins can manage widgets" ON public.widgets;
CREATE POLICY "Admins can manage widgets" ON public.widgets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON p.org_id = m.org_id
    WHERE p.id = project_id AND m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- Widget config policies
DROP POLICY IF EXISTS "Users can view widget config in their orgs" ON public.widget_config;
CREATE POLICY "Users can view widget config in their orgs" ON public.widget_config FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON p.org_id = m.org_id
    WHERE p.id = project_id AND m.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Admins can manage widget config" ON public.widget_config;
CREATE POLICY "Admins can manage widget config" ON public.widget_config FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON p.org_id = m.org_id
    WHERE p.id = project_id AND m.user_id = auth.uid() AND m.role = 'admin'
  )
);

-- Org invites policies
DROP POLICY IF EXISTS "Users can view invites in their orgs" ON public.org_invites;
CREATE POLICY "Users can view invites in their orgs" ON public.org_invites FOR SELECT USING (public.is_org_member(org_id));
DROP POLICY IF EXISTS "Admins can manage invites" ON public.org_invites;
CREATE POLICY "Admins can manage invites" ON public.org_invites FOR ALL USING (public.is_org_admin(org_id));

-- Platform admins policies
DROP POLICY IF EXISTS "Platform admins can view all" ON public.platform_admins;
CREATE POLICY "Platform admins can view all" ON public.platform_admins FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
);

-- Platform feedback policies
DROP POLICY IF EXISTS "Users can view own platform feedback" ON public.platform_feedback;
CREATE POLICY "Users can view own platform feedback" ON public.platform_feedback FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can insert platform feedback" ON public.platform_feedback;
CREATE POLICY "Anyone can insert platform feedback" ON public.platform_feedback FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Platform admins can manage platform feedback" ON public.platform_feedback;
CREATE POLICY "Platform admins can manage platform feedback" ON public.platform_feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
);

-- Invites policies (legacy)
DROP POLICY IF EXISTS "Users can view invites in their orgs" ON public.invites;
CREATE POLICY "Users can view invites in their orgs" ON public.invites FOR SELECT USING (public.is_org_member(org_id));
DROP POLICY IF EXISTS "Admins can manage invites" ON public.invites;
CREATE POLICY "Admins can manage invites" ON public.invites FOR ALL USING (public.is_org_admin(org_id));

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.feedback TO anon;
GRANT INSERT ON public.events TO anon;
GRANT INSERT ON public.platform_feedback TO anon;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.widget_config TO anon;

-- Grant permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant access to auth.users for get_users_lite function
GRANT SELECT ON auth.users TO authenticated;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample organizations (you'll need to replace these with real data)
-- Note: You'll need to create users first in Supabase Auth dashboard
-- and then update these UUIDs with real user IDs

-- Sample organization 1: Vamoot Inc
INSERT INTO public.organizations (id, name, slug) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Vamoot Inc', 'vamoot-inc')
ON CONFLICT (id) DO NOTHING;

-- Sample organization 2: Acme Corp
INSERT INTO public.organizations (id, name, slug) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'Acme Corp', 'acme-corp')
ON CONFLICT (id) DO NOTHING;

-- Sample organization 3: Tech Startup
INSERT INTO public.organizations (id, name, slug) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'Tech Startup', 'tech-startup')
ON CONFLICT (id) DO NOTHING;

-- Sample projects
INSERT INTO public.projects (id, org_id, name, description, api_key, allowed_origins) VALUES 
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Main Website', 'Primary website feedback collection', 'vamoot_main_2024_abc123', ARRAY['https://vamoot.com', 'https://www.vamoot.com']),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Mobile App', 'Mobile application feedback', 'vamoot_mobile_2024_def456', ARRAY['https://app.vamoot.com']),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'E-commerce Site', 'Online store feedback system', 'acme_store_2024_ghi789', ARRAY['https://store.acme.com']),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'SaaS Platform', 'Software as a service platform', 'tech_saas_2024_jkl012', ARRAY['https://platform.techstartup.com'])
ON CONFLICT (id) DO NOTHING;

-- Sample feedback
INSERT INTO public.feedback (id, project_id, rating, comment, email, name, metadata) VALUES 
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 5, 'Love the new design! Very intuitive and clean.', 'user1@example.com', 'John Doe', '{"source": "website", "page": "/dashboard"}'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 4, 'Great product, but could use better mobile support.', 'user2@example.com', 'Jane Smith', '{"source": "mobile", "page": "/login"}'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 3, 'The app crashes sometimes on iOS.', 'user3@example.com', 'Mike Johnson', '{"source": "ios_app", "version": "1.2.3"}'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 5, 'Excellent customer service and fast checkout!', 'user4@example.com', 'Sarah Wilson', '{"source": "checkout", "amount": 99.99}'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 2, 'Too many bugs in the latest update.', 'user5@example.com', 'Alex Brown', '{"source": "platform", "version": "2.1.0"}')
ON CONFLICT (id) DO NOTHING;

-- Sample events
INSERT INTO public.events (id, project_id, event_type, properties) VALUES 
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'page_view', '{"page": "/dashboard", "duration": 45}'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'button_click', '{"button": "submit_feedback", "page": "/feedback"}'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'app_open', '{"platform": "ios", "version": "1.2.3"}'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'purchase', '{"amount": 99.99, "currency": "USD", "product": "premium_plan"}'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 'error', '{"error_type": "validation", "field": "email"}')
ON CONFLICT (id) DO NOTHING;

-- Sample widget configs
INSERT INTO public.widget_config (id, project_id, config) VALUES 
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '{"theme": "light", "position": "bottom-right", "color": "#3B82F6", "enabled": true}'),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '{"theme": "dark", "position": "bottom-left", "color": "#10B981", "enabled": true}'),
('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '{"theme": "auto", "position": "top-right", "color": "#F59E0B", "enabled": false}'),
('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '{"theme": "light", "position": "center", "color": "#EF4444", "enabled": true}')
ON CONFLICT (id) DO NOTHING;

-- Sample platform feedback
INSERT INTO public.platform_feedback (id, email, subject, message, status) VALUES 
('aa0e8400-e29b-41d4-a716-446655440001', 'feedback@example.com', 'Feature Request', 'Would love to see dark mode support in the dashboard.', 'open'),
('aa0e8400-e29b-41d4-a716-446655440002', 'support@example.com', 'Bug Report', 'The export function is not working properly.', 'in_progress'),
('aa0e8400-e29b-41d4-a716-446655440003', 'user@example.com', 'General Question', 'How do I integrate the widget with React?', 'resolved')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- FINAL NOTES
-- =====================================================

-- IMPORTANT: After running this script, you need to:
-- 1. Create users in Supabase Auth dashboard
-- 2. Update the sample organization UUIDs with real user IDs
-- 3. Insert memberships for the users and organizations
-- 4. Update any hardcoded UUIDs in your application

-- Example membership insert (replace with real user IDs):
-- INSERT INTO public.memberships (org_id, user_id, role) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440001', 'REAL_USER_ID_HERE', 'admin');

-- To verify the setup:
-- SELECT 'Setup completed successfully!' as status;
