import { NextRequest, NextResponse } from 'next/server';
import { UserProfileService } from '../../../lib/user-profile-service';
import { cronScheduler } from '../../../lib/cron-scheduler';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId parameter is required' },
                { status: 400 }
            );
        }

        const cronJobs = await UserProfileService.getCronJobs(userId);
        const executions = await UserProfileService.getCronExecutions(userId, 10);

        return NextResponse.json({
            cronJobs,
            executions,
            activeJobsCount: cronScheduler.getActiveCronJobsCount()
        });
    } catch (error) {
        console.error('Error in GET /api/cron-jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, cronTime } = body;

        if (!userId || !cronTime) {
            return NextResponse.json(
                { error: 'userId and cronTime are required' },
                { status: 400 }
            );
        }

        // Validate cron time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(cronTime)) {
            return NextResponse.json(
                { error: 'Invalid cron time format. Use HH:MM format (e.g., "10:00")' },
                { status: 400 }
            );
        }

        // Check if user has a profile and can create cron jobs
        const profile = await UserProfileService.getUserProfile(userId);
        if (!profile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            );
        }

        if (profile.plan === 'free') {
            return NextResponse.json(
                { error: 'Cron jobs are not available for free plan' },
                { status: 403 }
            );
        }

        // Create cron job using the scheduler
        const cronJob = await cronScheduler.addCronJob(userId, cronTime);

        if (!cronJob) {
            return NextResponse.json(
                { error: 'Failed to create cron job' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Cron job scheduled for ${cronTime}`,
            cronJob
        });
    } catch (error) {
        console.error('Error in POST /api/cron-jobs:', error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes('Maximum cron jobs reached')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
                );
            }
            if (error.message.includes('already selected')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const jobId = searchParams.get('jobId');

        if (!userId || !jobId) {
            return NextResponse.json(
                { error: 'userId and jobId parameters are required' },
                { status: 400 }
            );
        }

        const success = await cronScheduler.removeCronJob(userId, parseInt(jobId));

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete cron job' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cron job deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /api/cron-jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 