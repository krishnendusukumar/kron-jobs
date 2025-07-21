import { NextRequest, NextResponse } from 'next/server';
import { cronScheduler } from '../../../../lib/cron-scheduler';

export async function POST(request: NextRequest) {
    try {
        // Initialize the cron scheduler
        await cronScheduler.initialize();

        return NextResponse.json({
            success: true,
            message: 'Cron scheduler initialized successfully',
            activeJobsCount: cronScheduler.getActiveCronJobsCount()
        });
    } catch (error) {
        console.error('Error initializing cron scheduler:', error);
        return NextResponse.json(
            { error: 'Failed to initialize cron scheduler' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            success: true,
            activeJobsCount: cronScheduler.getActiveCronJobsCount(),
            isInitialized: true
        });
    } catch (error) {
        console.error('Error getting cron scheduler status:', error);
        return NextResponse.json(
            { error: 'Failed to get cron scheduler status' },
            { status: 500 }
        );
    }
} 