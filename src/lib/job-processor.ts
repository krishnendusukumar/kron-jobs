import { scrapeAndSaveJobs } from './linkedin-scraper';
import { supabase } from './supabase';

interface JobTask {
    id: string;
    userId: string;
    keywords: string;
    location: string;
    f_WT?: string;
    timespan?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    error?: string;
    results?: any;
}

class JobProcessor {
    private isProcessing = false;
    private queue: JobTask[] = [];
    private processingTasks = new Map<string, JobTask>();

    // Add a new scraping task to the queue
    async addTask(params: {
        userId: string;
        keywords: string;
        location: string;
        f_WT?: string;
        timespan?: string;
    }): Promise<string> {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const task: JobTask = {
            id: taskId,
            userId: params.userId,
            keywords: params.keywords,
            location: params.location,
            f_WT: params.f_WT || '2',
            timespan: params.timespan || 'r86400',
            status: 'pending',
            createdAt: new Date()
        };

        this.queue.push(task);

        // Save task to database
        await this.saveTaskToDatabase(task);

        // Start processing if not already running
        if (!this.isProcessing) {
            this.processQueue();
        }

        return taskId;
    }

    // Get task status
    async getTaskStatus(taskId: string): Promise<JobTask | null> {
        // Check in-memory first
        const processingTask = this.processingTasks.get(taskId);
        if (processingTask) {
            return processingTask;
        }

        // Check database
        const { data, error } = await supabase
            .from('job_tasks')
            .select('*')
            .eq('id', taskId)
            .single();

        if (error || !data) {
            return null;
        }

        return data as JobTask;
    }

    // Process the queue of tasks
    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log(`Starting to process ${this.queue.length} tasks`);

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (!task) continue;

            await this.processTask(task);

            // Add delay between tasks to avoid overwhelming LinkedIn
            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        this.isProcessing = false;
        console.log('Finished processing all tasks');
    }

    // Process a single task
    private async processTask(task: JobTask) {
        try {
            console.log(`Processing task ${task.id} for user ${task.userId}`);

            // Update task status to processing
            task.status = 'processing';
            this.processingTasks.set(task.id, task);
            await this.updateTaskInDatabase(task);

            // Execute the scraping
            const results = await scrapeAndSaveJobs({
                keywords: task.keywords,
                location: task.location,
                f_WT: task.f_WT,
                timespan: task.timespan
            }, task.userId);

            // Update task status to completed
            task.status = 'completed';
            task.completedAt = new Date();
            task.results = results;
            this.processingTasks.delete(task.id);
            await this.updateTaskInDatabase(task);

            console.log(`Task ${task.id} completed successfully with ${results?.length || 0} jobs`);

        } catch (error: any) {
            console.error(`Task ${task.id} failed:`, error);

            // Update task status to failed
            task.status = 'failed';
            task.completedAt = new Date();
            task.error = error.message;
            this.processingTasks.delete(task.id);
            await this.updateTaskInDatabase(task);
        }
    }

    // Save task to database
    private async saveTaskToDatabase(task: JobTask) {
        try {
            const { error } = await supabase
                .from('job_tasks')
                .insert({
                    id: task.id,
                    user_id: task.userId,
                    keywords: task.keywords,
                    location: task.location,
                    f_wt: task.f_WT,
                    timespan: task.timespan,
                    status: task.status,
                    created_at: task.createdAt.toISOString()
                });

            if (error) {
                console.error('Error saving task to database:', error);
            }
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    }

    // Update task in database
    private async updateTaskInDatabase(task: JobTask) {
        try {
            const updateData: any = {
                status: task.status,
                updated_at: new Date().toISOString()
            };

            if (task.completedAt) {
                updateData.completed_at = task.completedAt.toISOString();
            }

            if (task.error) {
                updateData.error = task.error;
            }

            if (task.results) {
                updateData.results = task.results;
            }

            const { error } = await supabase
                .from('job_tasks')
                .update(updateData)
                .eq('id', task.id);

            if (error) {
                console.error('Error updating task in database:', error);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    }

    // Get all tasks for a user
    async getUserTasks(userId: string): Promise<JobTask[]> {
        try {
            const { data, error } = await supabase
                .from('job_tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user tasks:', error);
                return [];
            }

            return data as JobTask[];
        } catch (error) {
            console.error('Failed to fetch user tasks:', error);
            return [];
        }
    }

    // Get queue status
    getQueueStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.queue.length,
            processingTasks: Array.from(this.processingTasks.values())
        };
    }
}

// Export singleton instance
export const jobProcessor = new JobProcessor(); 