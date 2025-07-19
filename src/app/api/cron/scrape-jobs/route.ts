import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { JobService } from '@/lib/job-service';

export async function POST(req: NextRequest) {
    try {
        // Verify the request is from a legitimate cron service
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        console.log('🕐 Cron job triggered: Starting automated scraping for all users');

        // Get all users with job preferences
        const { data: users, error: usersError } = await supabase
            .from('job_preferences')
            .select('user_id, keywords, location, f_WT, timespan')
            .not('keywords', 'is', null)
            .not('location', 'is', null);

        if (usersError) {
            throw new Error(`Failed to fetch users: ${usersError.message}`);
        }

        if (!users || users.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users with job preferences found',
                jobsQueued: 0
            });
        }

        console.log(`📋 Found ${users.length} users with job preferences`);

        // Queue scraping jobs for each user
        const queuedJobs = [];
        for (const user of users) {
            try {
                const result = await JobService.requestScraping({
                    userId: user.user_id,
                    keywords: user.keywords,
                    location: user.location,
                    f_WT: user.f_WT || '2',
                    timespan: user.timespan || 'r86400',
                    start: 0, // Start from the beginning
                });

                queuedJobs.push({
                    userId: user.user_id,
                    jobId: result.jobId,
                    status: result.status
                });

                console.log(`✅ Queued scraping job for user ${user.user_id}`);
            } catch (error) {
                console.error(`❌ Failed to queue job for user ${user.user_id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully queued ${queuedJobs.length} scraping jobs`,
            jobsQueued: queuedJobs.length,
            jobs: queuedJobs
        });

    } catch (error: any) {
        console.error('❌ Error in cron job:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 