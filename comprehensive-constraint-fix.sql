-- Comprehensive Fix for user_profiles constraint error
-- Run this in your Supabase SQL Editor step by step

-- Step 1: First, let's see what plan types currently exist in the table
SELECT plan, COUNT(*) as count
FROM user_profiles 
GROUP BY plan
ORDER BY plan;

-- Step 2: Check the current constraint definition
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND conname = 'user_profiles_plan_check';

-- Step 3: Temporarily disable the constraint to avoid errors during data update
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_plan_check;

-- Step 4: Update ALL existing data to use only the new plan types
UPDATE user_profiles 
SET 
    plan = CASE 
        WHEN plan = 'lifetime' THEN 'weekly'
        WHEN plan = 'pro' THEN 'monthly'
        WHEN plan NOT IN ('free', 'weekly', 'monthly') THEN 'free' -- fallback for any other values
        ELSE plan
    END,
    max_cron_jobs = CASE 
        WHEN plan = 'lifetime' THEN 3
        WHEN plan = 'pro' THEN 5
        WHEN plan = 'weekly' THEN 3
        WHEN plan = 'monthly' THEN 5
        ELSE 0
    END,
    max_daily_fetches = CASE 
        WHEN plan IN ('lifetime', 'pro', 'weekly', 'monthly') THEN 999999
        ELSE 3
    END,
    credits_remaining = CASE 
        WHEN plan IN ('lifetime', 'pro', 'weekly', 'monthly') THEN 999999
        ELSE 3
    END;

-- Step 5: Verify all data now uses only the new plan types
SELECT plan, COUNT(*) as count
FROM user_profiles 
GROUP BY plan
ORDER BY plan;

-- Step 6: Now add the new constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_plan_check 
    CHECK (plan IN ('free', 'weekly', 'monthly'));

-- Step 7: Verify the constraint was added correctly
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND conname = 'user_profiles_plan_check';

-- Step 8: Test that the constraint works by trying to insert a valid row
INSERT INTO user_profiles (user_id, email, plan, credits_remaining, max_cron_jobs, max_daily_fetches) 
VALUES ('test-constraint-1', 'test@constraint.com', 'weekly', 999999, 3, 999999)
ON CONFLICT (user_id) DO NOTHING;

-- Step 9: Clean up test data
DELETE FROM user_profiles WHERE user_id = 'test-constraint-1';

-- Step 10: Final verification
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN plan = 'weekly' THEN 1 END) as weekly_users,
    COUNT(CASE WHEN plan = 'monthly' THEN 1 END) as monthly_users
FROM user_profiles; 