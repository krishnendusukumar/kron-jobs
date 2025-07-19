import { supabase } from './supabase';
import { jobQueue } from './job-queue';

export interface JobFilters {
    userId: string;
    keywords?: string;
    location?: string;
    applied?: boolean;
    hidden?: boolean;
    interview?: boolean;
    rejected?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'date' | 'title' | 'company';
    sortOrder?: 'asc' | 'desc';
}

export interface JobStats {
    total: number;
    applied: number;
    hidden: number;
    interview: number;
    rejected: number;
    new: number;
}

export class JobService {
    /**
     * Request a new scraping job to be added to the queue
     */
    static async requestScraping(params: {
        userId: string;
        keywords: string;
        location: string;
        f_WT?: string;
        timespan?: string;
        start?: number;
    }): Promise<{ jobId: string; status: string }> {
        try {
            const jobId = await jobQueue.addJob(params);
            return { jobId, status: 'pending' };
        } catch (error) {
            throw new Error(`Failed to queue scraping job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get the status of a scraping job
     */
    static async getScrapingStatus(jobId: string): Promise<any> {
        const job = await jobQueue.getJobStatus(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        return job;
    }

    /**
     * Get user's scraping job history
     */
    static async getUserScrapingHistory(userId: string): Promise<any[]> {
        return await jobQueue.getUserJobs(userId);
    }

    /**
     * Fetch jobs from database only (no scraping)
     */
    static async getJobs(filters: JobFilters): Promise<{ jobs: any[]; total: number }> {
        console.log('🔍 JobService.getJobs called with filters:', filters);

        let query = supabase
            .from('jobs')
            .select('*', { count: 'exact' })
            .eq('user_id', filters.userId);

        // Apply filters
        if (filters.keywords) {
            query = query.ilike('title', `%${filters.keywords}%`);
        }
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.applied !== undefined) {
            query = query.eq('applied', filters.applied ? 1 : 0);
        }
        if (filters.hidden !== undefined) {
            query = query.eq('hidden', filters.hidden ? 1 : 0);
        }
        if (filters.interview !== undefined) {
            query = query.eq('interview', filters.interview ? 1 : 0);
        }
        if (filters.rejected !== undefined) {
            query = query.eq('rejected', filters.rejected ? 1 : 0);
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const limit = filters.limit || 20;
        const offset = filters.offset || 0;
        query = query.range(offset, offset + limit - 1);

        console.log(`📊 Executing query for user: ${filters.userId}, limit: ${limit}, offset: ${offset}`);
        const { data: jobs, error, count } = await query;

        if (error) {
            console.error('❌ Database error:', error);
            throw new Error(`Failed to fetch jobs: ${error.message}`);
        }

        console.log(`✅ Database returned ${jobs?.length || 0} jobs, total count: ${count || 0}`);
        if (jobs && jobs.length > 0) {
            console.log('📋 Sample job from database:', {
                id: jobs[0].id,
                title: jobs[0].title,
                company: jobs[0].company,
                user_id: jobs[0].user_id,
                created_at: jobs[0].created_at
            });
        }

        return {
            jobs: jobs || [],
            total: count || 0,
        };
    }

    /**
     * Get job statistics for a user
     */
    static async getJobStats(userId: string): Promise<JobStats> {
        const { data, error } = await supabase
            .from('jobs')
            .select('applied, hidden, interview, rejected, created_at')
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Failed to fetch job stats: ${error.message}`);
        }

        const jobs = data || [];
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const stats: JobStats = {
            total: jobs.length,
            applied: jobs.filter(job => job.applied === 1).length,
            hidden: jobs.filter(job => job.hidden === 1).length,
            interview: jobs.filter(job => job.interview === 1).length,
            rejected: jobs.filter(job => job.rejected === 1).length,
            new: jobs.filter(job => new Date(job.created_at) > oneDayAgo).length,
        };

        return stats;
    }

    /**
     * Update job status (applied, hidden, interview, rejected)
     */
    static async updateJobStatus(jobId: string, userId: string, updates: {
        applied?: boolean;
        hidden?: boolean;
        interview?: boolean;
        rejected?: boolean;
    }): Promise<void> {
        const updateData: any = {};

        if (updates.applied !== undefined) updateData.applied = updates.applied ? 1 : 0;
        if (updates.hidden !== undefined) updateData.hidden = updates.hidden ? 1 : 0;
        if (updates.interview !== undefined) updateData.interview = updates.interview ? 1 : 0;
        if (updates.rejected !== undefined) updateData.rejected = updates.rejected ? 1 : 0;

        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('jobs')
            .update(updateData)
            .eq('id', jobId)
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Failed to update job status: ${error.message}`);
        }
    }

    /**
     * Delete a job
     */
    static async deleteJob(jobId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId)
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Failed to delete job: ${error.message}`);
        }
    }

    /**
     * Get a single job by ID
     */
    static async getJob(jobId: string, userId: string): Promise<any> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch job: ${error.message}`);
        }

        return data;
    }

    /**
     * Search jobs with full-text search
     */
    static async searchJobs(userId: string, searchTerm: string, limit: number = 20): Promise<any[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', userId)
            .or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to search jobs: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get recent jobs for a user
     */
    static async getRecentJobs(userId: string, limit: number = 10): Promise<any[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to fetch recent jobs: ${error.message}`);
        }

        return data || [];
    }
} 