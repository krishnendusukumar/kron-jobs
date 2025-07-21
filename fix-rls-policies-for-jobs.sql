-- Fix RLS policies for jobs table to work with application authentication
-- This script updates the RLS policies to work with the anon key and user_id field

-- First, drop the existing policies
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;

-- Create new policies that work with the application's user_id field
-- These policies allow access when user_id matches the authenticated user's email

-- Policy for viewing jobs (users can see their own jobs)
CREATE POLICY "Users can view own jobs" ON jobs
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'email' 
        OR user_id = current_setting('request.jwt.claims', true)::json ->> 'email'
        OR user_id = current_setting('app.current_user_email', true)
    );

-- Policy for inserting jobs (users can insert jobs with their own user_id)
CREATE POLICY "Users can insert own jobs" ON jobs
    FOR INSERT WITH CHECK (
        user_id = auth.jwt() ->> 'email' 
        OR user_id = current_setting('request.jwt.claims', true)::json ->> 'email'
        OR user_id = current_setting('app.current_user_email', true)
    );

-- Policy for updating jobs (users can update their own jobs)
CREATE POLICY "Users can update own jobs" ON jobs
    FOR UPDATE USING (
        user_id = auth.jwt() ->> 'email' 
        OR user_id = current_setting('request.jwt.claims', true)::json ->> 'email'
        OR user_id = current_setting('app.current_user_email', true)
    );

-- Alternative: If the above doesn't work, create a more permissive policy for development
-- Uncomment the following lines if you want to temporarily disable RLS restrictions:

-- DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;

-- CREATE POLICY "Allow all jobs access" ON jobs
--     FOR ALL USING (true);

-- CREATE POLICY "Allow all jobs insert" ON jobs
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow all jobs update" ON jobs
--     FOR UPDATE USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'jobs'; 