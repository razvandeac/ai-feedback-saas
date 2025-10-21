-- Add key column to projects table for widget system compatibility
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS key text;

-- Copy api_key values to key column for existing projects
UPDATE public.projects 
SET key = api_key
WHERE key IS NULL;

-- Make key NOT NULL
ALTER TABLE public.projects 
ALTER COLUMN key SET NOT NULL;

-- Create a unique index on key to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS projects_key_unique 
ON public.projects (key);
