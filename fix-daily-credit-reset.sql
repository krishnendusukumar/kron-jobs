-- Fix the reset_daily_credits function to properly handle weekly and monthly plans
-- Run this in your Supabase SQL Editor

-- Update the reset_daily_credits function for unlimited job search
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
        credits_reset_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE credits_reset_date < CURRENT_DATE;
    
    -- Log the reset action
    INSERT INTO audit_logs (action, resource_type, details)
    VALUES ('credits_reset', 'system', jsonb_build_object('reset_date', CURRENT_DATE));
END;
$$ LANGUAGE plpgsql;

-- Test the function by running it once
SELECT reset_daily_credits();

-- Verify the function works correctly by checking a few user profiles
SELECT 
    user_id, 
    email, 
    plan, 
    credits_remaining, 
    max_daily_fetches,
    credits_reset_date
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10; 