-- Supabase Storage Setup for Resumes
-- Run this in your Supabase SQL Editor to create the storage bucket

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for resumes bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;

-- Allow public read access to resumes
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'resumes');

-- Allow authenticated users to upload resumes
CREATE POLICY "Authenticated users can upload resumes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resumes' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete own resumes" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to update their own resumes
CREATE POLICY "Users can update own resumes" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    ); 