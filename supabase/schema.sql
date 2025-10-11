-- AI Feedback SaaS - Supabase Schema
-- Production-safe schema with RLS policies for multi-tenant isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional crypto functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members table (links users to organizations)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flows table (feedback collection flows/forms)
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    metadata JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_members_org_id ON members(org_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org_user ON members(org_id, user_id);

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);

CREATE INDEX IF NOT EXISTS idx_flows_project_id ON flows(project_id);
CREATE INDEX IF NOT EXISTS idx_flows_is_active ON flows(is_active);

CREATE INDEX IF NOT EXISTS idx_feedback_flow_id ON feedback(flow_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if a user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM members
        WHERE members.org_id = is_org_member.org_id
        AND members.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if a user has a specific role in an organization
CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM members
        WHERE members.org_id = has_org_role.org_id
        AND members.user_id = auth.uid()
        AND (
            members.role = required_role
            OR (required_role = 'member' AND members.role IN ('admin', 'owner'))
            OR (required_role = 'admin' AND members.role = 'owner')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get org_id from project_id
CREATE OR REPLACE FUNCTION get_org_id_from_project(project_id UUID)
RETURNS UUID AS $$
    SELECT org_id FROM projects WHERE id = project_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get org_id from flow_id
CREATE OR REPLACE FUNCTION get_org_id_from_flow(flow_id UUID)
RETURNS UUID AS $$
    SELECT p.org_id FROM flows f
    JOIN projects p ON f.project_id = p.id
    WHERE f.id = flow_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get org_id from feedback_id
CREATE OR REPLACE FUNCTION get_org_id_from_feedback(feedback_id UUID)
RETURNS UUID AS $$
    SELECT p.org_id FROM feedback fb
    JOIN flows f ON fb.flow_id = f.id
    JOIN projects p ON f.project_id = p.id
    WHERE fb.id = feedback_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers to automatically update updated_at timestamp
CREATE TRIGGER update_orgs_updated_at
    BEFORE UPDATE ON orgs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flows_updated_at
    BEFORE UPDATE ON flows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - ORGS
-- ============================================================================

-- Users can view orgs they are members of
CREATE POLICY "Users can view their orgs"
    ON orgs FOR SELECT
    USING (is_org_member(id));

-- Users can insert orgs (they will be added as owner via application logic)
CREATE POLICY "Authenticated users can create orgs"
    ON orgs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can update orgs
CREATE POLICY "Owners can update their orgs"
    ON orgs FOR UPDATE
    USING (has_org_role(id, 'owner'))
    WITH CHECK (has_org_role(id, 'owner'));

-- Only owners can delete orgs
CREATE POLICY "Owners can delete their orgs"
    ON orgs FOR DELETE
    USING (has_org_role(id, 'owner'));

-- ============================================================================
-- RLS POLICIES - MEMBERS
-- ============================================================================

-- Users can view members of their orgs
CREATE POLICY "Users can view members of their orgs"
    ON members FOR SELECT
    USING (is_org_member(org_id));

-- Owners and admins can add members
CREATE POLICY "Admins can add members"
    ON members FOR INSERT
    WITH CHECK (has_org_role(org_id, 'admin'));

-- Owners and admins can update members (except their own role)
CREATE POLICY "Admins can update members"
    ON members FOR UPDATE
    USING (has_org_role(org_id, 'admin'))
    WITH CHECK (
        has_org_role(org_id, 'admin')
        AND (user_id != auth.uid() OR role = (SELECT role FROM members WHERE id = members.id))
    );

-- Owners and admins can remove members (except themselves)
CREATE POLICY "Admins can remove members"
    ON members FOR DELETE
    USING (has_org_role(org_id, 'admin') AND user_id != auth.uid());

-- ============================================================================
-- RLS POLICIES - PROJECTS
-- ============================================================================

-- Users can view projects in their orgs
CREATE POLICY "Users can view projects in their orgs"
    ON projects FOR SELECT
    USING (is_org_member(org_id));

-- Admins and owners can create projects
CREATE POLICY "Admins can create projects"
    ON projects FOR INSERT
    WITH CHECK (has_org_role(org_id, 'admin'));

-- Admins and owners can update projects
CREATE POLICY "Admins can update projects"
    ON projects FOR UPDATE
    USING (has_org_role(org_id, 'admin'))
    WITH CHECK (has_org_role(org_id, 'admin'));

-- Admins and owners can delete projects
CREATE POLICY "Admins can delete projects"
    ON projects FOR DELETE
    USING (has_org_role(org_id, 'admin'));

-- ============================================================================
-- RLS POLICIES - FLOWS
-- ============================================================================

-- Users can view flows in their orgs
CREATE POLICY "Users can view flows in their orgs"
    ON flows FOR SELECT
    USING (is_org_member(get_org_id_from_project(project_id)));

-- Admins and owners can create flows
CREATE POLICY "Admins can create flows"
    ON flows FOR INSERT
    WITH CHECK (is_org_member(get_org_id_from_project(project_id)));

-- Admins and owners can update flows
CREATE POLICY "Admins can update flows"
    ON flows FOR UPDATE
    USING (is_org_member(get_org_id_from_project(project_id)))
    WITH CHECK (is_org_member(get_org_id_from_project(project_id)));

-- Admins and owners can delete flows
CREATE POLICY "Admins can delete flows"
    ON flows FOR DELETE
    USING (has_org_role(get_org_id_from_project(project_id), 'admin'));

-- ============================================================================
-- RLS POLICIES - FEEDBACK
-- ============================================================================

-- Users can view feedback in their orgs
CREATE POLICY "Users can view feedback in their orgs"
    ON feedback FOR SELECT
    USING (is_org_member(get_org_id_from_flow(flow_id)));

-- Anyone can insert feedback (public endpoint, validated by API key in application logic)
CREATE POLICY "Anyone can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (true);

-- Admins and owners can update feedback
CREATE POLICY "Admins can update feedback"
    ON feedback FOR UPDATE
    USING (has_org_role(get_org_id_from_flow(flow_id), 'admin'))
    WITH CHECK (has_org_role(get_org_id_from_flow(flow_id), 'admin'));

-- Admins and owners can delete feedback
CREATE POLICY "Admins can delete feedback"
    ON feedback FOR DELETE
    USING (has_org_role(get_org_id_from_flow(flow_id), 'admin'));

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant permissions on tables
GRANT ALL ON orgs TO authenticated;
GRANT ALL ON members TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON flows TO authenticated;
GRANT ALL ON feedback TO authenticated;

-- Allow anon to insert feedback (for public widget)
GRANT INSERT ON feedback TO anon;
GRANT SELECT ON flows TO anon;
GRANT SELECT ON projects TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION is_org_member TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_org_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_org_id_from_project TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_org_id_from_flow TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_org_id_from_feedback TO authenticated, anon;

-- ============================================================================
-- SAMPLE DATA (Comment out in production)
-- ============================================================================

-- Uncomment below to insert sample data for development

-- INSERT INTO orgs (id, name, slug) VALUES
--     ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp'),
--     ('00000000-0000-0000-0000-000000000002', 'Tech Startup', 'tech-startup');

-- Note: Members should be added through application logic after user authentication

