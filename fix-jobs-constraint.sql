-- Fix jobs table constraint to allow same job for multiple users
-- Run this in your Supabase SQL Editor

-- 1. Drop the existing unique constraint on job_url
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_job_url_key;

-- 2. Add a composite unique constraint on job_url and user_id
-- This allows the same job to be saved for multiple users
ALTER TABLE jobs ADD CONSTRAINT jobs_job_url_user_id_unique UNIQUE (job_url, user_id);

-- 3. Verify the change
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'jobs' 
    AND tc.constraint_type = 'UNIQUE'; 