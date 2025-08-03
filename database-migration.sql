-- Database Migration Script
-- Run this in your Supabase SQL Editor to fix the resumes table

-- First, check if resumes table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP DEFAULT NOW(),
    parsed_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add file_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'file_name') THEN
        ALTER TABLE resumes ADD COLUMN file_name VARCHAR(255);
    END IF;
    
    -- Add file_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'file_url') THEN
        ALTER TABLE resumes ADD COLUMN file_url TEXT;
    END IF;
    
    -- Add file_size column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'file_size') THEN
        ALTER TABLE resumes ADD COLUMN file_size INTEGER;
    END IF;
    
    -- Add upload_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'upload_date') THEN
        ALTER TABLE resumes ADD COLUMN upload_date TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Add parsed_data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resumes' AND column_name = 'parsed_data') THEN
        ALTER TABLE resumes ADD COLUMN parsed_data JSONB;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_upload_date ON resumes(upload_date);

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resumes (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

CREATE POLICY "Users can view own resumes" ON resumes
    FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own resumes" ON resumes
    FOR INSERT WITH CHECK (user_id = current_user);

CREATE POLICY "Users can delete own resumes" ON resumes
    FOR DELETE USING (user_id = current_user);

-- Fix clerk_user_id constraint issue
-- Remove unique constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_clerk_user_id_key'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_clerk_user_id_key;
    END IF;
END $$;

-- Add non-unique index instead
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Verify the resumes table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'resumes' 
ORDER BY ordinal_position; 