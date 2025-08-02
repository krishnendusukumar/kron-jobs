-- Add missing columns to jobs table if they don't exist
-- Run this in your Supabase SQL Editor

-- 1. Add applied column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'applied'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN applied INTEGER DEFAULT 0;
        RAISE NOTICE 'Added applied column to jobs table';
    ELSE
        RAISE NOTICE 'applied column already exists';
    END IF;
END $$;

-- 2. Add hidden column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'hidden'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN hidden INTEGER DEFAULT 0;
        RAISE NOTICE 'Added hidden column to jobs table';
    ELSE
        RAISE NOTICE 'hidden column already exists';
    END IF;
END $$;

-- 3. Add interview column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'interview'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN interview INTEGER DEFAULT 0;
        RAISE NOTICE 'Added interview column to jobs table';
    ELSE
        RAISE NOTICE 'interview column already exists';
    END IF;
END $$;

-- 4. Add rejected column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'rejected'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN rejected INTEGER DEFAULT 0;
        RAISE NOTICE 'Added rejected column to jobs table';
    ELSE
        RAISE NOTICE 'rejected column already exists';
    END IF;
END $$;

-- 5. Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to jobs table';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;
END $$;

-- 6. Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to jobs table';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- 7. Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Show sample data to verify everything works
SELECT 
    id,
    user_id,
    title,
    company,
    location,
    date,
    job_url,
    applied,
    hidden,
    interview,
    rejected,
    created_at,
    updated_at
FROM jobs 
LIMIT 3;

-- 9. Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_job_url ON jobs(job_url);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_applied ON jobs(applied);
CREATE INDEX IF NOT EXISTS idx_jobs_hidden ON jobs(hidden);
CREATE INDEX IF NOT EXISTS idx_jobs_interview ON jobs(interview);
CREATE INDEX IF NOT EXISTS idx_jobs_rejected ON jobs(rejected); 