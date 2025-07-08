-- Database Migration Script
-- Run this in your Supabase SQL Editor to add missing columns

-- Add missing columns to job_preferences table
ALTER TABLE job_preferences 
ADD COLUMN IF NOT EXISTS min_salary INTEGER,
ADD COLUMN IF NOT EXISTS notify_method VARCHAR(50) DEFAULT 'Mail',
ADD COLUMN IF NOT EXISTS experience VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Update existing records to have default values
UPDATE job_preferences 
SET 
    min_salary = 0,
    notify_method = 'Mail',
    experience = '',
    phone = ''
WHERE min_salary IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'job_preferences' 
ORDER BY ordinal_position; 