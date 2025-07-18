-- Check jobs data and pagination
-- Run this in your Supabase SQL Editor

-- 1. Check total number of jobs
SELECT 
    COUNT(*) as total_jobs,
    COUNT(DISTINCT user_id) as unique_users
FROM jobs;

-- 2. Check jobs per user
SELECT 
    user_id,
    COUNT(*) as job_count
FROM jobs 
GROUP BY user_id 
ORDER BY job_count DESC;

-- 3. Test pagination for a specific user (replace with actual email)
-- This simulates what the API does
WITH user_jobs AS (
    SELECT * FROM jobs 
    WHERE user_id = 'test@example.com'  -- Replace with actual email
    ORDER BY created_at DESC
)
SELECT 
    COUNT(*) as total_jobs_for_user,
    CEIL(COUNT(*)::float / 12) as total_pages_with_limit_12
FROM user_jobs;

-- 4. Test actual pagination ranges
-- Page 1: 0-11 (12 jobs)
-- Page 2: 12-23 (12 jobs)
-- Page 3: 24-35 (12 jobs)
-- etc.

WITH user_jobs AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
    FROM jobs 
    WHERE user_id = 'test@example.com'  -- Replace with actual email
)
SELECT 
    'Page 1 (rows 1-12)' as page_info,
    COUNT(*) as job_count
FROM user_jobs 
WHERE row_num BETWEEN 1 AND 12

UNION ALL

SELECT 
    'Page 2 (rows 13-24)' as page_info,
    COUNT(*) as job_count
FROM user_jobs 
WHERE row_num BETWEEN 13 AND 24

UNION ALL

SELECT 
    'Page 3 (rows 25-36)' as page_info,
    COUNT(*) as job_count
FROM user_jobs 
WHERE row_num BETWEEN 25 AND 36;

-- 5. Check if there are any issues with the data
SELECT 
    'Jobs with NULL user_id' as issue,
    COUNT(*) as count
FROM jobs 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'Jobs with empty user_id' as issue,
    COUNT(*) as count
FROM jobs 
WHERE user_id = ''

UNION ALL

SELECT 
    'Jobs with NULL created_at' as issue,
    COUNT(*) as count
FROM jobs 
WHERE created_at IS NULL;

-- 6. Sample of recent jobs
SELECT 
    id,
    user_id,
    title,
    company,
    created_at
FROM jobs 
ORDER BY created_at DESC 
LIMIT 10; 