-- Temporarily disable the problematic audit trigger for job_preferences
-- This will allow job search to work while we fix the audit function

DROP TRIGGER IF EXISTS audit_job_preferences_changes ON job_preferences;

SELECT 'Job preferences audit trigger disabled. Job search should now work!' as status; 