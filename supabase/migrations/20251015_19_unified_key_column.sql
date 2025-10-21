-- Unified key approach: Use only the 'key' column for both widget and feedback systems
-- Add key column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS key text;

-- Copy api_key values to key column for existing projects
UPDATE public.projects 
SET key = api_key
WHERE key IS NULL;

-- Make key NOT NULL
ALTER TABLE public.projects 
ALTER COLUMN key SET NOT NULL;

-- Create a unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS projects_key_unique 
ON public.projects (key);

-- Remove api_key column to avoid confusion
ALTER TABLE public.projects DROP COLUMN IF EXISTS api_key;
