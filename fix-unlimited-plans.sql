-- Fix Unlimited Plans - Update check_user_limits function to handle unlimited job search
-- Run this in your Supabase SQL Editor

-- 1. Create or replace the check_user_limits function to handle unlimited plans
CREATE OR REPLACE FUNCTION check_user_limits(p_user_id VARCHAR)
RETURNS TABLE (
    can_perform_action BOOLEAN,
    credits_remaining INTEGER,
    daily_searches_used INTEGER,
    daily_searches_limit INTEGER,
    cron_jobs_used INTEGER,
    cron_jobs_limit INTEGER
) AS $$
DECLARE
    v_profile user_profiles%ROWTYPE;
    v_daily_searches INTEGER;
    v_cron_jobs INTEGER;
    v_has_unlimited_search BOOLEAN;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Check if user has unlimited search (weekly/monthly plans)
    v_has_unlimited_search := v_profile.plan IN ('weekly', 'monthly');
    
    -- Get daily searches used
    SELECT COALESCE(SUM(credits_consumed), 0) INTO v_daily_searches
    FROM user_usage
    WHERE user_id = p_user_id 
    AND usage_type = 'job_search'
    AND created_at >= CURRENT_DATE;
    
    -- Get cron jobs used
    SELECT COUNT(*) INTO v_cron_jobs
    FROM cron_jobs
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Return results
    RETURN QUERY
    SELECT 
        -- can_perform_action: Always true for unlimited plans, check credits for free plan
        CASE 
            WHEN v_has_unlimited_search THEN true
            ELSE v_profile.credits_remaining > 0
        END as can_perform_action,
        
        -- credits_remaining: Show unlimited for paid plans, actual credits for free
        CASE 
            WHEN v_has_unlimited_search THEN 999999
            ELSE v_profile.credits_remaining
        END as credits_remaining,
        
        -- daily_searches_used: Track usage but don't limit for unlimited plans
        v_daily_searches as daily_searches_used,
        
        -- daily_searches_limit: Unlimited for paid plans, actual limit for free
        CASE 
            WHEN v_has_unlimited_search THEN 999999
            ELSE v_profile.max_daily_fetches
        END as daily_searches_limit,
        
        -- cron_jobs_used: Actual count
        v_cron_jobs as cron_jobs_used,
        
        -- cron_jobs_limit: Based on plan
        v_profile.max_cron_jobs as cron_jobs_limit;
END;
$$ LANGUAGE plpgsql;

-- 2. Update the consume_credit function to handle unlimited plans
CREATE OR REPLACE FUNCTION consume_credit(
    p_user_id VARCHAR,
    p_usage_type VARCHAR DEFAULT 'job_search',
    p_credits_consumed INTEGER DEFAULT 1,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
    v_profile user_profiles%ROWTYPE;
    v_has_unlimited_search BOOLEAN;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    
    -- Check if user has unlimited search
    v_has_unlimited_search := v_profile.plan IN ('weekly', 'monthly');
    
    -- Always track usage for analytics
    INSERT INTO user_usage (user_id, usage_type, credits_consumed, details)
    VALUES (p_user_id, p_usage_type, p_credits_consumed, p_details);
    
    -- Only consume credits for free plan users
    IF NOT v_has_unlimited_search THEN
        UPDATE user_profiles 
        SET credits_remaining = GREATEST(0, credits_remaining - p_credits_consumed)
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Update all existing weekly/monthly users to have unlimited credits
UPDATE user_profiles 
SET 
    credits_remaining = 999999,
    max_daily_fetches = 999999
WHERE plan IN ('weekly', 'monthly');

-- 4. Create a function to check if user can perform unlimited actions
CREATE OR REPLACE FUNCTION can_perform_unlimited_action(
    p_user_id VARCHAR,
    p_action_type VARCHAR DEFAULT 'job_search'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan VARCHAR;
BEGIN
    SELECT plan INTO user_plan
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    RETURN user_plan IN ('weekly', 'monthly');
END;
$$ LANGUAGE plpgsql;

-- 5. Verify the functions work correctly
SELECT 
    'Functions updated successfully' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN plan = 'weekly' THEN 1 END) as weekly_users,
    COUNT(CASE WHEN plan = 'monthly' THEN 1 END) as monthly_users
FROM user_profiles;

-- 6. Test the check_user_limits function for a weekly user
-- Replace 'your-test-user-id' with an actual user ID from your table
-- SELECT * FROM check_user_limits('your-test-user-id'); 