-- Fix job_preferences audit trigger issue
-- The audit trigger is trying to access user_id field which doesn't exist in job_preferences table

-- Drop the problematic audit trigger
DROP TRIGGER IF EXISTS audit_job_preferences_changes ON job_preferences;

-- Create a specific audit function for job_preferences that uses email instead of user_id
CREATE OR REPLACE FUNCTION audit_job_preferences_actions()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (NEW.email, 'created', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (NEW.email, 'updated', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
        VALUES (OLD.email, 'deleted', TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the new audit trigger for job_preferences
CREATE TRIGGER audit_job_preferences_changes
    AFTER INSERT OR UPDATE OR DELETE ON job_preferences
    FOR EACH ROW EXECUTE FUNCTION audit_job_preferences_actions();

-- Test the fix by inserting a sample preference
INSERT INTO job_preferences (email, job_title, location, keywords, experience, notify_method) 
VALUES ('test-fix@example.com', 'Test Job', 'Test Location', 'test keywords', 'entry', 'Mail')
ON CONFLICT (email) DO UPDATE SET
    job_title = EXCLUDED.job_title,
    location = EXCLUDED.location,
    keywords = EXCLUDED.keywords,
    experience = EXCLUDED.experience,
    notify_method = EXCLUDED.notify_method,
    updated_at = NOW();

-- Clean up test data
DELETE FROM job_preferences WHERE email = 'test-fix@example.com';

SELECT 'Job preferences audit trigger fixed successfully!' as status; 