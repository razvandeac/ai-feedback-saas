-- Add require_project_origins flag to projects table
-- When true, this project uses ONLY its allowed_origins list (ignores global env)

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS require_project_origins boolean DEFAULT false;

COMMENT ON COLUMN public.projects.require_project_origins IS 
  'When true, this project ignores CORS_ALLOWED_ORIGINS env var and uses only its allowed_origins list. Enables complete per-customer CORS isolation.';

