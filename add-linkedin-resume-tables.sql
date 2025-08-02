-- Add LinkedIn Profile and Resume Upload tables
-- Run this in your Supabase SQL Editor

-- LinkedIn Profile table
CREATE TABLE IF NOT EXISTS linkedin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    linkedin_url TEXT,
    profile_data JSONB,
    name TEXT,
    current_job_title TEXT,
    company TEXT,
    location TEXT,
    summary TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    certifications JSONB,
    languages TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Resume table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    parsed_data JSONB,
    name TEXT,
    email TEXT,
    phone TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    certifications JSONB,
    languages TEXT[],
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_user_id ON linkedin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_created_at ON linkedin_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at);

-- Add RLS policies
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- LinkedIn profiles policies
CREATE POLICY "Users can view their own LinkedIn profile" ON linkedin_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own LinkedIn profile" ON linkedin_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own LinkedIn profile" ON linkedin_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own LinkedIn profile" ON linkedin_profiles
    FOR DELETE USING (auth.uid()::text = user_id);

-- Resumes policies
CREATE POLICY "Users can view their own resumes" ON resumes
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own resumes" ON resumes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own resumes" ON resumes
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own resumes" ON resumes
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_linkedin_profiles_updated_at 
    BEFORE UPDATE ON linkedin_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at 
    BEFORE UPDATE ON resumes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 