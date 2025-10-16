-- =====================================================
-- COMPLETE PRODUCTION DATABASE RESET
-- This will drop all tables and recreate from scratch
-- =====================================================

-- WARNING: This will delete ALL data in production!
-- Make sure you have backups if needed

-- Drop all existing tables and functions
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Set proper ownership
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Now run the exported schema
-- (The content from production_schema.sql will be inserted here)
