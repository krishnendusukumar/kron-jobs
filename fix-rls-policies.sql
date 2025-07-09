-- Fix RLS Policies for KronJob
-- Run this in your Supabase SQL Editor

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'job_preferences';

-- Drop existing policies for job_preferences
DROP POLICY IF EXISTS "Users can view own job preferences" ON job_preferences;
DROP POLICY IF EXISTS "Users can insert own job preferences" ON job_preferences;
DROP POLICY IF EXISTS "Users can update own job preferences" ON job_preferences;

-- Create new policies that work without authentication
-- Allow all operations for now (you can restrict this later when you add auth)

-- Policy for SELECT (viewing)
CREATE POLICY "Allow all job preferences operations" ON job_preferences
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: If you want to restrict by email, use this instead:
-- CREATE POLICY "Allow job preferences by email" ON job_preferences
--     FOR ALL USING (email IS NOT NULL) WITH CHECK (email IS NOT NULL);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'job_preferences';

-- Test the policies by trying to insert a test record
INSERT INTO job_preferences (email, job_title, location, keywords) 
VALUES ('test@example.com', 'Test Job', 'Test Location', 'test keywords')
ON CONFLICT (email) DO UPDATE SET 
    job_title = EXCLUDED.job_title,
    location = EXCLUDED.location,
    keywords = EXCLUDED.keywords;

-- Clean up test record
DELETE FROM job_preferences WHERE email = 'test@example.com'; 