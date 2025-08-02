-- Fix LinkedIn Profile table - Add unique constraint
-- Run this in your Supabase SQL Editor

-- Add unique constraint on user_id for linkedin_profiles table
ALTER TABLE linkedin_profiles 
ADD CONSTRAINT linkedin_profiles_user_id_unique 
UNIQUE (user_id);

-- Verify the constraint was added
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'linkedin_profiles' 
AND constraint_type = 'UNIQUE'; 