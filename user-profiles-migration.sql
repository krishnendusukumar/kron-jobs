-- User Profiles Migration for Tiered Pricing and Cron Scheduler
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table for pricing tiers and cron scheduling
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'lifetime', 'pro')),
    credits_remaining INTEGER NOT NULL DEFAULT 3,
    credits_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cron_times TEXT[] DEFAULT '{}', -- Array of cron time slots e.g. ["10:00", "18:00"]
    max_cron_jobs INTEGER NOT NULL DEFAULT 0,
    max_daily_fetches INTEGER NOT NULL DEFAULT 3,
    upgrade_source VARCHAR(50) CHECK (upgrade_source IN ('stripe', 'manual', null)),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create cron_jobs table for tracking scheduled jobs
CREATE TABLE IF NOT EXISTS cron_jobs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    cron_time VARCHAR(10) NOT NULL, -- e.g. "10:00", "18:00"
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create cron_executions table for tracking individual job runs
CREATE TABLE IF NOT EXISTS cron_executions (
    id SERIAL PRIMARY KEY,
    cron_job_id INTEGER REFERENCES cron_jobs(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    execution_time TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    jobs_found INTEGER DEFAULT 0,
    jobs_added INTEGER DEFAULT 0,
    error_message TEXT,
    execution_duration_ms INTEGER,
    proxy_used VARCHAR(255)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan ON user_profiles(plan);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_user_id ON cron_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_is_active ON cron_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_cron_executions_cron_job_id ON cron_executions(cron_job_id);
CREATE INDEX IF NOT EXISTS idx_cron_executions_user_id ON cron_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_cron_executions_execution_time ON cron_executions(execution_time);

-- 5. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_executions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (user_id = current_user OR email = current_user);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = current_user OR email = current_user);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (user_id = current_user OR email = current_user);

-- 7. Create RLS policies for cron_jobs
CREATE POLICY "Users can view own cron jobs" ON cron_jobs
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own cron jobs" ON cron_jobs
    FOR INSERT WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update own cron jobs" ON cron_jobs
    FOR UPDATE USING (user_id = current_user);

CREATE POLICY "Users can delete own cron jobs" ON cron_jobs
    FOR DELETE USING (user_id = current_user);

-- 8. Create RLS policies for cron_executions
CREATE POLICY "Users can view own cron executions" ON cron_executions
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own cron executions" ON cron_executions
    FOR INSERT WITH CHECK (user_id = current_user);

-- 9. Create function to reset daily credits
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        credits_remaining = 
            CASE 
                WHEN plan = 'free' THEN 3
                WHEN plan = 'lifetime' THEN 3
                WHEN plan = 'pro' THEN 5
                ELSE 3
            END,
        credits_reset_date = CURRENT_DATE
    WHERE credits_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get available cron time slots
CREATE OR REPLACE FUNCTION get_available_cron_slots(user_plan VARCHAR)
RETURNS TEXT[] AS $$
BEGIN
    RETURN CASE 
        WHEN user_plan = 'free' THEN ARRAY[]::TEXT[]
        WHEN user_plan = 'lifetime' THEN ARRAY['10:00', '12:00', '15:00', '18:00', '21:00']::TEXT[]
        WHEN user_plan = 'pro' THEN ARRAY['10:00', '12:00', '15:00', '18:00', '21:00']::TEXT[]
        ELSE ARRAY[]::TEXT[]
    END;
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to get max cron jobs for plan
CREATE OR REPLACE FUNCTION get_max_cron_jobs(user_plan VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE 
        WHEN user_plan = 'free' THEN 0
        WHEN user_plan = 'lifetime' THEN 2
        WHEN user_plan = 'pro' THEN 5
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cron_jobs_updated_at 
    BEFORE UPDATE ON cron_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cron_executions_updated_at 
    BEFORE UPDATE ON cron_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Insert sample user profiles for testing
INSERT INTO user_profiles (user_id, email, plan, credits_remaining, max_cron_jobs, max_daily_fetches) 
VALUES 
    ('test-user-1', 'test@example.com', 'free', 3, 0, 3),
    ('test-user-2', 'lifetime@example.com', 'lifetime', 3, 2, 3),
    ('test-user-3', 'pro@example.com', 'pro', 5, 5, 5)
ON CONFLICT (user_id) DO NOTHING;

-- 14. Create a scheduled job to reset credits daily (if using pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('reset-daily-credits', '0 0 * * *', 'SELECT reset_daily_credits();'); 