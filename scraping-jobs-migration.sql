-- Create scraping_jobs table for tracking background scraping tasks
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    keywords TEXT NOT NULL,
    location TEXT NOT NULL,
    f_WT TEXT DEFAULT '2',
    timespan TEXT DEFAULT 'r86400',
    start INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result JSONB,
    
    -- Add indexes for better performance
    CONSTRAINT fk_scraping_jobs_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_user_id ON scraping_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at);

-- Enable Row Level Security
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scraping jobs" ON scraping_jobs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own scraping jobs" ON scraping_jobs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "System can update scraping jobs" ON scraping_jobs
    FOR UPDATE USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_scraping_jobs_updated_at 
    BEFORE UPDATE ON scraping_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE scraping_jobs IS 'Tracks background scraping jobs for users';
COMMENT ON COLUMN scraping_jobs.status IS 'Job status: pending, processing, completed, failed';
COMMENT ON COLUMN scraping_jobs.result IS 'JSON object containing job results (jobsScraped, jobsSaved, error)'; 