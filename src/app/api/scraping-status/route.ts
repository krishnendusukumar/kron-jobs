import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        const userId = searchParams.get('userId');

        if (!jobId || !userId) {
            return NextResponse.json({
                success: false,
                error: 'jobId and userId are required'
            }, { status: 400 });
        }

        console.log(`🔍 Checking status for job: ${jobId}, user: ${userId}`);

        // Check job_tasks table first
        const { data: taskData, error: taskError } = await supabase
            .from('job_tasks')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (taskError && taskError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Error checking job_tasks:', taskError);
            return NextResponse.json({
                success: false,
                error: 'Failed to check job status'
            }, { status: 500 });
        }

        if (taskData) {
            console.log(`📊 Job status from job_tasks: ${taskData.status}`);
            return NextResponse.json({
                success: true,
                status: taskData.status,
                error: taskData.error,
                results: taskData.results,
                completed_at: taskData.completed_at
            });
        }

        // If not found in job_tasks, check if it's a temporary job (direct scraping)
        if (jobId.startsWith('temp-')) {
            // For temporary jobs, assume they're completed after a short delay
            const jobTimestamp = parseInt(jobId.split('_')[1]);
            const now = Date.now();
            const timeDiff = now - jobTimestamp;

            // If more than 10 seconds have passed, assume completed
            if (timeDiff > 10000) {
                console.log(`✅ Temporary job ${jobId} assumed completed`);
                return NextResponse.json({
                    success: true,
                    status: 'completed',
                    error: null,
                    results: [],
                    completed_at: new Date().toISOString()
                });
            } else {
                console.log(`⏳ Temporary job ${jobId} still processing`);
                return NextResponse.json({
                    success: true,
                    status: 'processing',
                    error: null,
                    results: null,
                    completed_at: null
                });
            }
        }

        // Job not found
        console.log(`❌ Job ${jobId} not found`);
        return NextResponse.json({
            success: false,
            error: 'Job not found'
        }, { status: 404 });

    } catch (error: any) {
        console.error('❌ Error in scraping-status:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 