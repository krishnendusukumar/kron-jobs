-- Weekly and Monthly Pricing Migration
-- Run this in your Supabase SQL Editor to update pricing to weekly ($3) and monthly ($9) with unlimited job search

-- 1. Update the plan constraint to include new plan types
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_plan_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_plan_check 
    CHECK (plan IN ('free', 'weekly', 'monthly'));

-- 2. Update the upgrade_source constraint to include new payment sources
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_upgrade_source_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_upgrade_source_check 
    CHECK (upgrade_source IN ('stripe', 'manual', 'dodo', 'weekly', 'monthly', null));

-- 3. Update the reset_daily_credits function for unlimited job search
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        credits_remaining = 
            CASE 
                WHEN plan = 'free' THEN 3
                WHEN plan = 'weekly' THEN 999999 -- Unlimited (high number)
                WHEN plan = 'monthly' THEN 999999 -- Unlimited (high number)
                ELSE 3
            END,
        credits_reset_date = CURRENT_DATE
    WHERE credits_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 4. Update the get_available_cron_slots function
CREATE OR REPLACE FUNCTION get_available_cron_slots(user_plan VARCHAR)
RETURNS TEXT[] AS $$
BEGIN
    RETURN CASE 
        WHEN user_plan = 'free' THEN ARRAY[]::TEXT[]
        WHEN user_plan = 'weekly' THEN ARRAY['10:00', '12:00', '15:00', '18:00', '21:00']::TEXT[]
        WHEN user_plan = 'monthly' THEN ARRAY['10:00', '12:00', '15:00', '18:00', '21:00']::TEXT[]
        ELSE ARRAY[]::TEXT[]
    END;
END;
$$ LANGUAGE plpgsql;

-- 5. Update the get_max_cron_jobs function
CREATE OR REPLACE FUNCTION get_max_cron_jobs(user_plan VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE 
        WHEN user_plan = 'free' THEN 0
        WHEN user_plan = 'weekly' THEN 3
        WHEN user_plan = 'monthly' THEN 5
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get max daily fetches for plan
CREATE OR REPLACE FUNCTION get_max_daily_fetches(user_plan VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE 
        WHEN user_plan = 'free' THEN 3
        WHEN user_plan = 'weekly' THEN 999999 -- Unlimited (high number)
        WHEN user_plan = 'monthly' THEN 999999 -- Unlimited (high number)
        ELSE 3
    END;
END;
$$ LANGUAGE plpgsql;

-- 7. Update existing user profiles to new plan structure (optional - for testing)
-- Uncomment the lines below if you want to update existing test users
/*
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
*/

-- 8. Insert sample user profiles for testing with new plans
INSERT INTO user_profiles (user_id, email, plan, credits_remaining, max_cron_jobs, max_daily_fetches) 
VALUES 
    ('test-weekly-1', 'weekly@example.com', 'weekly', 999999, 3, 999999),
    ('test-monthly-1', 'monthly@example.com', 'monthly', 999999, 5, 999999)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Create indexes for new plan types (if needed)
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_weekly ON user_profiles(plan) WHERE plan = 'weekly';
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_monthly ON user_profiles(plan) WHERE plan = 'monthly';

-- 10. Update RLS policies to include new plan types (if needed)
-- The existing policies should work with the new plan types since they use current_user

-- 11. Create a view for easy plan management
CREATE OR REPLACE VIEW plan_summary AS
SELECT 
    plan,
    COUNT(*) as user_count,
    AVG(credits_remaining) as avg_credits,
    AVG(max_cron_jobs) as avg_cron_jobs,
    AVG(max_daily_fetches) as avg_daily_fetches
FROM user_profiles 
GROUP BY plan
ORDER BY 
    CASE plan 
        WHEN 'free' THEN 1 
        WHEN 'weekly' THEN 2 
        WHEN 'monthly' THEN 3 
        ELSE 4 
    END;

-- 12. Create function to upgrade user plan
CREATE OR REPLACE FUNCTION upgrade_user_plan(
    p_user_id VARCHAR,
    p_new_plan VARCHAR,
    p_upgrade_source VARCHAR DEFAULT 'manual'
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        plan = p_new_plan,
        max_cron_jobs = get_max_cron_jobs(p_new_plan),
        max_daily_fetches = get_max_daily_fetches(p_new_plan),
        credits_remaining = CASE 
            WHEN p_new_plan IN ('weekly', 'monthly') THEN 999999
            ELSE 3
        END,
        upgrade_source = p_upgrade_source,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql; 