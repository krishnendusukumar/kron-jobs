import * as cron from 'node-cron';
import { UserProfileService, CronJob, CronExecution } from './user-profile-service';
import { supabase } from './supabase';

export class CronScheduler {
    private static instance: CronScheduler;
    private cronJobs: Map<string, cron.ScheduledTask> = new Map();
    private isInitialized = false;

    private constructor() { }

    static getInstance(): CronScheduler {
        if (!CronScheduler.instance) {
            CronScheduler.instance = new CronScheduler();
        }
        return CronScheduler.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        console.log('🕐 Initializing Cron Scheduler...');

        // Load all active cron jobs from database
        await this.loadActiveCronJobs();

        // Schedule daily credit reset at midnight
        this.scheduleDailyCreditReset();

        // Schedule periodic check for due cron jobs (every 5 minutes)
        this.schedulePeriodicCheck();

        this.isInitialized = true;
        console.log('✅ Cron Scheduler initialized successfully');
    }

    private async loadActiveCronJobs(): Promise<void> {
        try {
            const { data: cronJobs, error } = await supabase
                .from('cron_jobs')
                .select('*')
                .eq('is_active', true);

            if (error) {
                console.error('Error loading active cron jobs:', error);
                return;
            }

            for (const job of cronJobs || []) {
                this.scheduleCronJob(job);
            }

            console.log(`📅 Loaded ${cronJobs?.length || 0} active cron jobs`);
        } catch (error) {
            console.error('Error in loadActiveCronJobs:', error);
        }
    }

    private scheduleCronJob(cronJob: CronJob): void {
        const jobKey = `job_${cronJob.id}`;

        // Remove existing job if it exists
        if (this.cronJobs.has(jobKey)) {
            this.cronJobs.get(jobKey)?.stop();
            this.cronJobs.delete(jobKey);
        }

        // Convert time to cron expression (e.g., "10:00" -> "0 10 * * *")
        const [hours, minutes] = cronJob.cron_time.split(':').map(Number);
        const cronExpression = `${minutes} ${hours} * * *`;

        const task = cron.schedule(cronExpression, async () => {
            await this.executeCronJob(cronJob);
        }, {
            scheduled: true,
            timezone: "UTC"
        });

        this.cronJobs.set(jobKey, task);
        console.log(`⏰ Scheduled cron job ${cronJob.id} for ${cronJob.cron_time} (${cronExpression})`);
    }

    private async executeCronJob(cronJob: CronJob): Promise<void> {
        console.log(`🚀 Executing cron job ${cronJob.id} for user ${cronJob.user_id} at ${cronJob.cron_time}`);

        // Create execution record
        const execution = await UserProfileService.createCronExecution(cronJob.id, cronJob.user_id);
        if (!execution) {
            console.error(`❌ Failed to create execution record for cron job ${cronJob.id}`);
            return;
        }

        const startTime = Date.now();

        try {
            // Update execution status to running
            await UserProfileService.updateCronExecution(execution.id, {
                status: 'running'
            });

            // Get user preferences
            const { data: preferences, error: prefError } = await supabase
                .from('job_preferences')
                .select('*')
                .eq('email', cronJob.user_id)
                .single();

            if (prefError || !preferences) {
                throw new Error('User preferences not found');
            }

            // Check if user has credits remaining
            const profile = await UserProfileService.getUserProfile(cronJob.user_id);
            if (!profile || profile.credits_remaining <= 0) {
                throw new Error('No credits remaining');
            }

            // Consume credit
            const creditConsumed = await UserProfileService.consumeCredit(cronJob.user_id);
            if (!creditConsumed) {
                throw new Error('Failed to consume credit');
            }

            // Execute scraping
            const scrapingResult = await this.executeScraping(preferences, cronJob.user_id);

            const executionDuration = Date.now() - startTime;

            // Update execution record with results
            await UserProfileService.updateCronExecution(execution.id, {
                status: 'completed',
                jobs_found: scrapingResult.jobsFound,
                jobs_added: scrapingResult.jobsAdded,
                execution_duration_ms: executionDuration,
                proxy_used: scrapingResult.proxyUsed
            });

            // Update cron job next run time
            await UserProfileService.updateCronJobNextRun(cronJob.id);

            console.log(`✅ Cron job ${cronJob.id} completed successfully. Jobs found: ${scrapingResult.jobsFound}, Jobs added: ${scrapingResult.jobsAdded}`);

        } catch (error) {
            const executionDuration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            console.error(`❌ Cron job ${cronJob.id} failed:`, errorMessage);

            // Update execution record with error
            await UserProfileService.updateCronExecution(execution.id, {
                status: 'failed',
                error_message: errorMessage,
                execution_duration_ms: executionDuration
            });

            // Update cron job error count
            await this.updateCronJobErrorCount(cronJob.id, errorMessage);
        }
    }

    private async executeScraping(preferences: any, userId: string): Promise<{
        jobsFound: number;
        jobsAdded: number;
        proxyUsed?: string;
    }> {
        // This would integrate with your existing scraping logic
        // For now, we'll simulate the scraping process

        try {
            // Call your existing scraping API
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/start-scraping`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keywords: preferences.keywords,
                    location: preferences.location,
                    userId: userId,
                    isCronExecution: true
                }),
            });

            if (!response.ok) {
                throw new Error(`Scraping API returned ${response.status}`);
            }

            const result = await response.json();

            return {
                jobsFound: result.jobsFound || 0,
                jobsAdded: result.jobsAdded || 0,
                proxyUsed: result.proxyUsed
            };
        } catch (error) {
            console.error('Error executing scraping:', error);
            throw error;
        }
    }

    private async updateCronJobErrorCount(cronJobId: number, errorMessage: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('cron_jobs')
                .update({
                    error_count: supabase.rpc('increment', { value: 1 }),
                    last_error: errorMessage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', cronJobId);

            if (error) {
                console.error('Error updating cron job error count:', error);
            }
        } catch (error) {
            console.error('Error in updateCronJobErrorCount:', error);
        }
    }

    private scheduleDailyCreditReset(): void {
        // Reset credits daily at midnight UTC
        cron.schedule('0 0 * * *', async () => {
            console.log('🔄 Resetting daily credits...');
            await UserProfileService.resetDailyCredits();
            console.log('✅ Daily credits reset completed');
        }, {
            scheduled: true,
            timezone: "UTC"
        });

        console.log('⏰ Scheduled daily credit reset at midnight UTC');
    }

    private schedulePeriodicCheck(): void {
        // Check for due cron jobs every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            await this.checkDueCronJobs();
        }, {
            scheduled: true,
            timezone: "UTC"
        });

        console.log('⏰ Scheduled periodic cron job check every 5 minutes');
    }

    private async checkDueCronJobs(): Promise<void> {
        try {
            const dueJobs = await UserProfileService.getDueCronJobs();

            if (dueJobs.length > 0) {
                console.log(`🔍 Found ${dueJobs.length} due cron jobs`);

                for (const job of dueJobs) {
                    await this.executeCronJob(job);
                }
            }
        } catch (error) {
            console.error('Error checking due cron jobs:', error);
        }
    }

    // Public methods for managing cron jobs
    async addCronJob(userId: string, cronTime: string): Promise<CronJob | null> {
        const cronJob = await UserProfileService.createCronJob(userId, cronTime);
        if (cronJob) {
            this.scheduleCronJob(cronJob);
        }
        return cronJob;
    }

    async removeCronJob(userId: string, cronJobId: number): Promise<boolean> {
        const success = await UserProfileService.deleteCronJob(userId, cronJobId);
        if (success) {
            const jobKey = `job_${cronJobId}`;
            if (this.cronJobs.has(jobKey)) {
                this.cronJobs.get(jobKey)?.stop();
                this.cronJobs.delete(jobKey);
            }
        }
        return success;
    }

    async updateCronJob(cronJob: CronJob): Promise<void> {
        if (cronJob.is_active) {
            this.scheduleCronJob(cronJob);
        } else {
            const jobKey = `job_${cronJob.id}`;
            if (this.cronJobs.has(jobKey)) {
                this.cronJobs.get(jobKey)?.stop();
                this.cronJobs.delete(jobKey);
            }
        }
    }

    getActiveCronJobsCount(): number {
        return this.cronJobs.size;
    }

    stop(): void {
        console.log('🛑 Stopping Cron Scheduler...');
        for (const [key, task] of this.cronJobs) {
            task.stop();
            console.log(`⏹️ Stopped cron job: ${key}`);
        }
        this.cronJobs.clear();
        this.isInitialized = false;
        console.log('✅ Cron Scheduler stopped');
    }
}

// Export singleton instance
export const cronScheduler = CronScheduler.getInstance(); 