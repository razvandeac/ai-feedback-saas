-- Fix foreign key constraint that's pointing to wrong table
-- The error shows it's trying to reference "widgets" table instead of "studio_widgets"

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_widget_id_fkey;

-- Add the correct foreign key constraint to studio_widgets
ALTER TABLE projects 
  ADD CONSTRAINT projects_widget_id_fkey 
  FOREIGN KEY (widget_id) REFERENCES studio_widgets(id) ON DELETE SET NULL;

-- Verify the constraint was created correctly
-- This will show the constraint details
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='projects' 
  AND kcu.column_name='widget_id';
