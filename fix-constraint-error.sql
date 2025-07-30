-- Fix for constraint error on user_profiles table
-- Run this in your Supabase SQL Editor

-- Step 1: Check current constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND conname = 'user_profiles_plan_check';

-- Step 2: Drop the existing constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_plan_check;

-- Step 3: Add the new constraint with correct plan types
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_plan_check 
    CHECK (plan IN ('free', 'weekly', 'monthly'));

-- Step 4: Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND conname = 'user_profiles_plan_check';

-- Step 5: Check if there are any rows with invalid plan types
SELECT id, user_id, email, plan 
FROM user_profiles 
WHERE plan NOT IN ('free', 'weekly', 'monthly');

-- Step 6: Update any remaining old plan types
UPDATE user_profiles 
SET 
    plan = CASE 
        WHEN plan = 'lifetime' THEN 'weekly'
        WHEN plan = 'pro' THEN 'monthly'
        ELSE plan
    END,
    max_cron_jobs = CASE 
        WHEN plan = 'lifetime' THEN 3
        WHEN plan = 'pro' THEN 5
        ELSE max_cron_jobs
    END,
    max_daily_fetches = CASE 
        WHEN plan IN ('lifetime', 'pro') THEN 999999
        ELSE max_daily_fetches
    END,
    credits_remaining = CASE 
        WHEN plan IN ('lifetime', 'pro') THEN 999999
        ELSE credits_remaining
    END
WHERE plan IN ('lifetime', 'pro');

-- Step 7: Verify all rows now have valid plan types
SELECT plan, COUNT(*) as count
FROM user_profiles 
GROUP BY plan
ORDER BY plan; 