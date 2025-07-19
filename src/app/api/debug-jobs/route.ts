import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'userId is required'
            }, { status: 400 });
        }

        console.log(`🔍 Debug: Checking jobs for user: ${userId}`);

        // Check jobs table
        const { data: jobs, error: jobsError, count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (jobsError) {
            console.error('❌ Error fetching jobs:', jobsError);
            return NextResponse.json({
                success: false,
                error: `Failed to fetch jobs: ${jobsError.message}`
            }, { status: 500 });
        }

        // Check job_tasks table
        const { data: tasks, error: tasksError } = await supabase
            .from('job_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (tasksError) {
            console.error('❌ Error fetching tasks:', tasksError);
        }

        console.log(`✅ Debug results for ${userId}:`);
        console.log(`📊 Jobs in database: ${jobs?.length || 0} (total count: ${count || 0})`);
        console.log(`📋 Tasks in database: ${tasks?.length || 0}`);

        if (jobs && jobs.length > 0) {
            console.log('📋 Sample jobs:', jobs.slice(0, 3).map(job => ({
                id: job.id,
                title: job.title,
                company: job.company,
                created_at: job.created_at,
                user_id: job.user_id
            })));
        }

        if (tasks && tasks.length > 0) {
            console.log('📋 Sample tasks:', tasks.slice(0, 3).map(task => ({
                id: task.id,
                status: task.status,
                keywords: task.keywords,
                created_at: task.created_at,
                completed_at: task.completed_at
            })));
        }

        return NextResponse.json({
            success: true,
            debug: {
                userId,
                jobsCount: jobs?.length || 0,
                totalJobsCount: count || 0,
                tasksCount: tasks?.length || 0,
                sampleJobs: jobs?.slice(0, 3) || [],
                sampleTasks: tasks?.slice(0, 3) || [],
                allJobs: jobs || [],
                allTasks: tasks || []
            }
        });

    } catch (error: any) {
        console.error('❌ Error in debug-jobs:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 