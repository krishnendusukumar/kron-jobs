-- Make phone field optional in job_preferences table
-- Run this in your Supabase SQL Editor

-- First, let's check the current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'job_preferences' 
AND column_name = 'phone';

-- Ensure phone column is nullable (optional)
ALTER TABLE job_preferences 
ALTER COLUMN phone DROP NOT NULL;

-- Set default value to NULL for phone column
ALTER TABLE job_preferences 
ALTER COLUMN phone SET DEFAULT NULL;

-- Update any existing empty strings to NULL
UPDATE job_preferences 
SET phone = NULL 
WHERE phone = '' OR phone IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'job_preferences' 
AND column_name = 'phone';

-- Test insert without phone
INSERT INTO job_preferences (email, job_title, location, keywords) 
VALUES ('test-no-phone@example.com', 'Test Job', 'Test Location', 'test keywords')
ON CONFLICT (email) DO NOTHING;

-- Clean up test record
DELETE FROM job_preferences WHERE email = 'test-no-phone@example.com'; 