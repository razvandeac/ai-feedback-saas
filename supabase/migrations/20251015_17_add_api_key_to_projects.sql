-- Add api_key column to projects table if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS api_key text;

-- Add allowed_origins column if it doesn't exist  
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS allowed_origins text[] DEFAULT '{}'::text[];

-- Add updated_at column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Make api_key NOT NULL if it's currently nullable
-- First, set a default value for existing rows
UPDATE public.projects 
SET api_key = 'legacy-key-' || substr(md5(id::text), 1, 12)
WHERE api_key IS NULL;

-- Then make it NOT NULL
ALTER TABLE public.projects 
ALTER COLUMN api_key SET NOT NULL;

-- Create a unique index on api_key to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS projects_api_key_unique 
ON public.projects (api_key);

-- Update any existing projects to have proper API keys
UPDATE public.projects 
SET api_key = 'key-' || substr(md5(id::text), 1, 12)
WHERE api_key LIKE 'legacy-key-%';
