-- Add allowed_origins column to projects table
-- This allows per-project CORS domain restrictions

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS allowed_origins text[] DEFAULT NULL;

COMMENT ON COLUMN public.projects.allowed_origins IS 
  'Optional array of allowed origins for this project widget. Merged with global CORS_ALLOWED_ORIGINS env var. Supports wildcards like *.example.com';

-- Example usage:
-- UPDATE projects SET allowed_origins = ARRAY['https://customer.com', '*.partner.io'] WHERE key = 'abc123';

