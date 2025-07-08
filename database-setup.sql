-- Database Setup for LinkedIn Job Scraper
-- Run this in your Supabase SQL Editor

-- 1. Create job_preferences table (if not exists)
CREATE TABLE IF NOT EXISTS job_preferences (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    keywords TEXT,
    min_salary INTEGER,
    notify_method VARCHAR(50) DEFAULT 'Mail',
    experience VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create job_tasks table for background processing
CREATE TABLE IF NOT EXISTS job_tasks (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    keywords TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    f_wt VARCHAR(10),
    timespan VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error TEXT,
    results JSONB
);

-- 3. Create jobs table for storing scraped jobs
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    date VARCHAR(100),
    job_url VARCHAR(500) UNIQUE,
    job_description TEXT,
    applied INTEGER DEFAULT 0,
    hidden INTEGER DEFAULT 0,
    interview INTEGER DEFAULT 0,
    rejected INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_preferences_email ON job_preferences(email);
CREATE INDEX IF NOT EXISTS idx_job_tasks_user_id ON job_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_job_tasks_status ON job_tasks(status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_job_url ON jobs(job_url);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- 5. Create RLS (Row Level Security) policies
ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for job_preferences (users can only see their own preferences)
CREATE POLICY "Users can view own job preferences" ON job_preferences
    FOR SELECT USING (email = current_user);

CREATE POLICY "Users can insert own job preferences" ON job_preferences
    FOR INSERT WITH CHECK (email = current_user);

CREATE POLICY "Users can update own job preferences" ON job_preferences
    FOR UPDATE USING (email = current_user);

-- Policy for job_tasks (users can only see their own tasks)
CREATE POLICY "Users can view own job tasks" ON job_tasks
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own job tasks" ON job_tasks
    FOR INSERT WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update own job tasks" ON job_tasks
    FOR UPDATE USING (user_id = current_user);

-- Policy for jobs (users can only see their own jobs)
CREATE POLICY "Users can view own jobs" ON jobs
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own jobs" ON jobs
    FOR INSERT WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update own jobs" ON jobs
    FOR UPDATE USING (user_id = current_user);

-- 6. Insert sample data for testing
INSERT INTO job_preferences (email, job_title, location, keywords) 
VALUES 
    ('test@example.com', 'JavaScript Developer', 'Remote', 'React Node.js TypeScript'),
    ('user@example.com', 'Python Developer', 'New York', 'Django Flask FastAPI')
ON CONFLICT (email) DO NOTHING;

-- 7. Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers to automatically update updated_at
CREATE TRIGGER update_job_preferences_updated_at 
    BEFORE UPDATE ON job_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_tasks_updated_at 
    BEFORE UPDATE ON job_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 