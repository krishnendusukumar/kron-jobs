-- Temporarily disable RLS on job_preferences table for debugging
-- Run this in your Supabase SQL Editor

-- Disable RLS on job_preferences table
ALTER TABLE job_preferences DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'job_preferences';

-- Test query to make sure we can read from the table
SELECT COUNT(*) FROM job_preferences;

-- To re-enable RLS later, run:
-- ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY; 