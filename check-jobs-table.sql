-- Check the current structure of the jobs table
-- Run this in your Supabase SQL Editor to see the actual table structure

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data to verify columns exist
SELECT 
    id,
    user_id,
    title,
    company,
    location,
    date,
    job_url,
    job_description,
    applied,
    hidden,
    interview,
    rejected,
    created_at,
    updated_at
FROM jobs 
LIMIT 5;

-- Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'applied'
    ) THEN 'applied column EXISTS' ELSE 'applied column MISSING' END as applied_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'hidden'
    ) THEN 'hidden column EXISTS' ELSE 'hidden column MISSING' END as hidden_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'created_at'
    ) THEN 'created_at column EXISTS' ELSE 'created_at column MISSING' END as created_at_status; 