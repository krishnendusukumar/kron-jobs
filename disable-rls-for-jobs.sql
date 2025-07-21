-- Temporarily disable RLS for jobs table to test if that's causing the issue
-- This will allow the application to access all jobs regardless of user_id

-- Disable RLS on jobs table
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'jobs';

-- Test query to see if we can access jobs
SELECT COUNT(*) as total_jobs FROM jobs;
SELECT COUNT(*) as user_jobs FROM jobs WHERE user_id = 'sukumarkrishnendu@gmail.com';

-- If you want to re-enable RLS later, run:
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY; 