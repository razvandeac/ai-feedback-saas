-- Create studio_widgets table
CREATE TABLE IF NOT EXISTS studio_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  widget_config jsonb NOT NULL DEFAULT '{}',
  published_config jsonb,
  published_at timestamptz,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add widget_id foreign key to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS widget_id uuid REFERENCES studio_widgets(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS studio_widgets_org_id_idx ON studio_widgets(org_id);
CREATE INDEX IF NOT EXISTS projects_widget_id_idx ON projects(widget_id);

-- Enable RLS
ALTER TABLE studio_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for studio_widgets
CREATE POLICY "studio_widgets_member_select" ON studio_widgets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members m
      WHERE m.org_id = studio_widgets.org_id 
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "studio_widgets_member_insert" ON studio_widgets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members m
      WHERE m.org_id = studio_widgets.org_id 
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "studio_widgets_member_update" ON studio_widgets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_members m
      WHERE m.org_id = studio_widgets.org_id 
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "studio_widgets_admin_publish" ON studio_widgets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM org_members m
      WHERE m.org_id = studio_widgets.org_id 
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );
