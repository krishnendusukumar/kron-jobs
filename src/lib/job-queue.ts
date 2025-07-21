import { supabase } from './supabase';

export interface ScrapingJob {
    id: string;
    userId: string;
    keywords: string;
    location: string;
    f_WT?: string;
    timespan?: string;
    start?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    result?: {
        jobsScraped: number;
        jobsSaved: number;
        error?: string;
    };
}

export interface JobQueueConfig {
    maxConcurrentJobs: number;
    retryAttempts: number;
    retryDelay: number;
}

const defaultConfig: JobQueueConfig = {
    maxConcurrentJobs: 3,
    retryAttempts: 3,
    retryDelay: 5000,
};

class JobQueue {
    private config: JobQueueConfig;
    private processingJobs: Set<string> = new Set();

    constructor(config: Partial<JobQueueConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    async addJob(jobData: Omit<ScrapingJob, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
        console.log('🔍 JobQueue.addJob called with:', jobData);

        const job: Omit<ScrapingJob, 'id'> = {
            ...jobData,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            // Try to use the existing job_tasks table instead of scraping_jobs
            const insertData = {
                id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: jobData.userId,
                keywords: jobData.keywords,
                location: jobData.location,
                f_wt: jobData.f_WT || '',
                timespan: jobData.timespan || 'r86400',
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                completed_at: null,
                error: null,
                results: null
            };

            console.log('🔍 Inserting job into job_tasks table:', insertData);

            const { data, error } = await supabase
                .from('job_tasks')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('❌ Error inserting job into job_tasks:', error);
                throw new Error(`Failed to add job to queue: ${error.message}`);
            }

            console.log('✅ Job added to job_tasks table:', data);

            // Execute the job immediately since we don't have a background processor
            console.log('🚀 Executing job immediately...');
            this.executeJobDirectly({
                id: data.id,
                ...jobData,
                status: 'processing',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return data.id;
        } catch (error: any) {
            // If the table doesn't exist, fall back to direct scraping
            console.warn('⚠️ job_tasks table not found, falling back to direct scraping:', error.message);

            // Execute the job immediately as a fallback
            const tempJobId = `temp-${Date.now()}`;
            this.executeJobDirectly({
                id: tempJobId,
                ...jobData,
                status: 'processing',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return tempJobId;
        }
    }

    async getJobStatus(jobId: string): Promise<ScrapingJob | null> {
        // Handle temporary job IDs (fallback case)
        if (jobId.startsWith('temp-')) {
            return {
                id: jobId,
                userId: 'unknown',
                keywords: '',
                location: '',
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date(),
                result: {
                    jobsScraped: 0,
                    jobsSaved: 0,
                }
            };
        }

        try {
            const { data, error } = await supabase
                .from('job_tasks')
                .select('*')
                .eq('id', jobId)
                .single();

            if (error) {
                console.error('Error fetching job status:', error);
                return null;
            }

            // Convert job_tasks format to ScrapingJob format
            return {
                id: data.id,
                userId: data.user_id,
                keywords: data.keywords,
                location: data.location,
                f_WT: data.f_wt,
                timespan: data.timespan,
                status: data.status as any,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                result: data.results ? {
                    jobsScraped: data.results.jobsScraped || 0,
                    jobsSaved: data.results.jobsSaved || 0,
                    error: data.error
                } : undefined
            };
        } catch (error) {
            console.error('Error fetching job status:', error);
            return null;
        }
    }

    async getUserJobs(userId: string): Promise<ScrapingJob[]> {
        const { data, error } = await supabase
            .from('job_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching user jobs:', error);
            return [];
        }

        // Convert job_tasks format to ScrapingJob format
        return (data || []).map(task => ({
            id: task.id,
            userId: task.user_id,
            keywords: task.keywords,
            location: task.location,
            f_WT: task.f_wt,
            timespan: task.timespan,
            status: task.status as any,
            createdAt: new Date(task.created_at),
            updatedAt: new Date(task.updated_at),
            result: task.results ? {
                jobsScraped: task.results[0]?.jobsScraped || 0,
                jobsSaved: task.results[0]?.jobsSaved || 0,
                error: task.error
            } : undefined
        }));
    }

    async processNextJob(): Promise<void> {
        if (this.processingJobs.size >= this.config.maxConcurrentJobs) {
            return;
        }

        const { data: pendingJob } = await supabase
            .from('scraping_jobs')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (!pendingJob) {
            return;
        }

        this.processingJobs.add(pendingJob.id);

        try {
            await this.updateJobStatus(pendingJob.id, 'processing');
            await this.executeJob(pendingJob);
            await this.updateJobStatus(pendingJob.id, 'completed');
        } catch (error) {
            console.error(`Job ${pendingJob.id} failed:`, error);
            await this.updateJobStatus(pendingJob.id, 'failed', {
                jobsScraped: 0,
                jobsSaved: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            this.processingJobs.delete(pendingJob.id);
            // Process next job
            setTimeout(() => this.processNextJob(), 1000);
        }
    }

    private async executeJob(job: ScrapingJob): Promise<void> {
        const { scrapeLinkedInJobs } = await import('./linkedin-scraper');

        const jobs = await scrapeLinkedInJobs({
            keywords: job.keywords,
            location: job.location,
            f_WT: job.f_WT,
            timespan: job.timespan,
            start: job.start,
        });

        const { saveJobsToDatabase } = await import('./job-database');
        const savedCount = await saveJobsToDatabase(job.userId, jobs);

        await this.updateJobStatus(job.id, 'completed', {
            jobsScraped: jobs.length,
            jobsSaved: savedCount,
        });
    }

    private async executeJobDirectly(job: ScrapingJob): Promise<void> {
        console.log(`🚀 Executing job directly: ${job.id}`);

        try {
            // Update job status to processing
            if (!job.id.startsWith('temp-')) {
                await this.updateJobStatusInJobTasks(job.id, 'processing');
            }

            console.log(`🔍 Starting LinkedIn scraping for: ${job.keywords} in ${job.location}`);

            const { scrapeLinkedInJobs } = await import('./linkedin-scraper');
            console.log('✅ LinkedIn scraper module imported successfully');

            const scrapingParams = {
                keywords: job.keywords,
                location: job.location,
                f_WT: job.f_WT,
                timespan: job.timespan,
                start: job.start,
            };

            console.log('📋 Scraping parameters:', scrapingParams);

            const jobs = await scrapeLinkedInJobs(scrapingParams);

            console.log(`📊 Scraped ${jobs.length} jobs, now saving to database...`);

            const { saveJobsToDatabase } = await import('./job-database');
            const savedCount = await saveJobsToDatabase(job.userId, jobs);

            console.log(`✅ Database save completed: ${savedCount} jobs saved`);

            // Update job status to completed
            if (!job.id.startsWith('temp-')) {
                await this.updateJobStatusInJobTasks(job.id, 'completed', {
                    jobsScraped: jobs.length,
                    jobsSaved: savedCount,
                });
            }

            console.log(`✅ Direct scraping completed: ${jobs.length} jobs scraped, ${savedCount} saved`);
        } catch (error) {
            console.error('❌ Direct scraping failed:', error);

            // Update job status to failed
            if (!job.id.startsWith('temp-')) {
                await this.updateJobStatusInJobTasks(job.id, 'failed', {
                    jobsScraped: 0,
                    jobsSaved: 0,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
    }

    private async updateJobStatusInJobTasks(
        jobId: string,
        status: 'pending' | 'processing' | 'completed' | 'failed',
        result?: {
            jobsScraped: number;
            jobsSaved: number;
            error?: string;
        }
    ): Promise<void> {
        const updateData: any = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
            updateData.results = result ? [result] : [];
        } else if (status === 'failed') {
            updateData.error = result?.error || 'Unknown error';
            updateData.results = result ? [result] : [];
        }

        const { error } = await supabase
            .from('job_tasks')
            .update(updateData)
            .eq('id', jobId);

        if (error) {
            console.error('Error updating job status in job_tasks:', error);
        }
    }

    private async updateJobStatus(
        jobId: string,
        status: ScrapingJob['status'],
        result?: ScrapingJob['result']
    ): Promise<void> {
        const updateData: Partial<ScrapingJob> = {
            status,
            updatedAt: new Date(),
        };

        if (result) {
            updateData.result = result;
        }

        const { error } = await supabase
            .from('scraping_jobs')
            .update(updateData)
            .eq('id', jobId);

        if (error) {
            console.error('Error updating job status:', error);
        }
    }

    async cleanupOldJobs(daysToKeep: number = 7): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const { error } = await supabase
            .from('scraping_jobs')
            .delete()
            .lt('created_at', cutoffDate.toISOString());

        if (error) {
            console.error('Error cleaning up old jobs:', error);
        }
    }
}

// Singleton instance
export const jobQueue = new JobQueue();

// Background processing
if (typeof window === 'undefined') {
    // Only run on server side
    setInterval(() => {
        jobQueue.processNextJob();
    }, 5000); // Check for new jobs every 5 seconds

    // Cleanup old jobs daily
    setInterval(() => {
        jobQueue.cleanupOldJobs();
    }, 24 * 60 * 60 * 1000);
} 