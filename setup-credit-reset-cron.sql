-- Setup Credit Reset Cron Job
-- This script sets up a cron job to reset user credits daily at 5:30 AM India time (12:00 AM UTC)

-- First, ensure the pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing cron job if it exists
SELECT cron.unschedule('reset-daily-credits') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'reset-daily-credits'
);

-- Schedule the credit reset job to run at 12:00 AM UTC (5:30 AM India time)
-- The cron expression '0 0 * * *' means: minute=0, hour=0, day=*, month=*, day_of_week=*
-- This runs at midnight UTC every day
SELECT cron.schedule(
    'reset-daily-credits',
    '0 0 * * *',  -- Run at 12:00 AM UTC (5:30 AM India time)
    'SELECT reset_daily_credits();'
);

-- Verify the cron job was created
SELECT jobname, schedule, command, active 
FROM cron.job 
WHERE jobname = 'reset-daily-credits';

-- Test the reset function manually (optional - uncomment to test)
-- SELECT reset_daily_credits();

-- Show current cron jobs
SELECT jobname, schedule, command, active FROM cron.job; 