-- Clerk Integration Migration for Enhanced SaaS User Management
-- Run this in your Supabase SQL Editor

-- 1. Update user_profiles table to better support Clerk integration
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP,
ADD COLUMN IF NOT EXISTS sign_up_date TIMESTAMP DEFAULT NOW();

-- 2. Create index for Clerk user ID
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- 3. Create usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    usage_type VARCHAR(50) NOT NULL, -- 'job_search', 'cron_execution', 'api_call'
    credits_consumed INTEGER DEFAULT 1,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create billing table for Stripe integration
CREATE TABLE IF NOT EXISTS billing_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(50) NOT NULL, -- 'lifetime', 'pro'
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_created_at ON user_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user_id ON billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_stripe_customer_id ON billing_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 7. Enable RLS on new tables
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for user_usage
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own usage" ON user_usage
    FOR INSERT WITH CHECK (user_id = current_user);

-- 9. Create RLS policies for billing_subscriptions
CREATE POLICY "Users can view own billing" ON billing_subscriptions
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can update own billing" ON billing_subscriptions
    FOR UPDATE USING (user_id = current_user);

-- 10. Create RLS policies for audit_logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (user_id = current_user);

-- 11. Create function to track usage
CREATE OR REPLACE FUNCTION track_user_usage(
    p_user_id VARCHAR,
    p_usage_type VARCHAR,
    p_credits_consumed INTEGER DEFAULT 1,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
    INSERT INTO user_usage (user_id, usage_type, credits_consumed, details)
    VALUES (p_user_id, p_usage_type, p_credits_consumed, p_details);
    
    -- Update user profile credits
    UPDATE user_profiles 
    SET credits_remaining = GREATEST(0, credits_remaining - p_credits_consumed)
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function to get user usage summary
CREATE OR REPLACE FUNCTION get_user_usage_summary(p_user_id VARCHAR, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_searches INTEGER,
    total_cron_executions INTEGER,
    total_api_calls INTEGER,
    credits_consumed INTEGER,
    daily_usage JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN u.usage_type = 'job_search' THEN 1 END)::INTEGER as total_searches,
        COUNT(CASE WHEN u.usage_type = 'cron_execution' THEN 1 END)::INTEGER as total_cron_executions,
        COUNT(CASE WHEN u.usage_type = 'api_call' THEN 1 END)::INTEGER as total_api_calls,
        COALESCE(SUM(u.credits_consumed), 0)::INTEGER as credits_consumed,
        COALESCE(
            jsonb_object_agg(
                DATE(u.created_at)::text,
                COUNT(*)
            ),
            '{}'::jsonb
        ) as daily_usage
    FROM user_usage u
    WHERE u.user_id = p_user_id 
    AND u.created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- 13. Create function to check user limits
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
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 0, 0, 0, 0;
        RETURN;
    END IF;
    
    -- Get daily searches used today
    SELECT COUNT(*) INTO v_daily_searches 
    FROM user_usage 
    WHERE user_id = p_user_id 
    AND usage_type = 'job_search' 
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Get active cron jobs
    SELECT COUNT(*) INTO v_cron_jobs 
    FROM cron_jobs 
    WHERE user_id = p_user_id AND is_active = true;
    
    RETURN QUERY SELECT 
        v_profile.credits_remaining > 0,
        v_profile.credits_remaining,
        v_daily_searches,
        v_profile.max_daily_fetches,
        v_cron_jobs,
        v_profile.max_cron_jobs;
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for audit logging
CREATE OR REPLACE FUNCTION audit_user_actions()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (NEW.user_id, 'created', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (NEW.user_id, 'updated', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (OLD.user_id, 'deleted', TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 15. Apply audit triggers to key tables
CREATE TRIGGER audit_user_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_user_actions();

CREATE TRIGGER audit_cron_jobs_changes
    AFTER INSERT OR UPDATE OR DELETE ON cron_jobs
    FOR EACH ROW EXECUTE FUNCTION audit_user_actions();

CREATE TRIGGER audit_job_preferences_changes
    AFTER INSERT OR UPDATE OR DELETE ON job_preferences
    FOR EACH ROW EXECUTE FUNCTION audit_user_actions();

-- 16. Create function to sync Clerk user data
CREATE OR REPLACE FUNCTION sync_clerk_user(
    p_clerk_user_id VARCHAR,
    p_email VARCHAR,
    p_first_name VARCHAR DEFAULT NULL,
    p_last_name VARCHAR DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_email_verified BOOLEAN DEFAULT false
)
RETURNS user_profiles AS $$
DECLARE
    v_profile user_profiles%ROWTYPE;
BEGIN
    -- Try to find existing profile by Clerk user ID
    SELECT * INTO v_profile FROM user_profiles WHERE clerk_user_id = p_clerk_user_id;
    
    IF FOUND THEN
        -- Update existing profile
        UPDATE user_profiles SET
            email = p_email,
            first_name = COALESCE(p_first_name, first_name),
            last_name = COALESCE(p_last_name, last_name),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            email_verified = p_email_verified,
            updated_at = NOW()
        WHERE clerk_user_id = p_clerk_user_id
        RETURNING * INTO v_profile;
    ELSE
        -- Create new profile with free tier
        INSERT INTO user_profiles (
            user_id, clerk_user_id, email, first_name, last_name, 
            avatar_url, email_verified, plan, credits_remaining, 
            max_cron_jobs, max_daily_fetches
        ) VALUES (
            p_clerk_user_id, p_clerk_user_id, p_email, p_first_name, p_last_name,
            p_avatar_url, p_email_verified, 'free', 3, 0, 3
        )
        RETURNING * INTO v_profile;
    END IF;
    
    RETURN v_profile;
END;
$$ LANGUAGE plpgsql;

-- 17. Insert sample data for testing (only if not exists)
INSERT INTO user_profiles (user_id, clerk_user_id, email, plan, credits_remaining, max_cron_jobs, max_daily_fetches) 
VALUES 
    ('clerk_test_user_1', 'clerk_test_user_1', 'clerk_test1@example.com', 'free', 3, 0, 3),
    ('clerk_test_user_2', 'clerk_test_user_2', 'clerk_test2@example.com', 'lifetime', 3, 2, 3),
    ('clerk_test_user_3', 'clerk_test_user_3', 'clerk_test3@example.com', 'pro', 5, 5, 5)
ON CONFLICT (user_id) DO NOTHING;

-- 18. Create function to reset credits daily (enhanced)
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
    -- Reset credits based on plan
    UPDATE user_profiles 
    SET 
        credits_remaining = 
            CASE 
                WHEN plan = 'free' THEN 3
                WHEN plan = 'lifetime' THEN 3
                WHEN plan = 'pro' THEN 5
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